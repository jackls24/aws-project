
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "aws" {
  region = "us-east-1"
}

#######################
# VPC & Subnets
#######################
resource "aws_vpc" "main" {
  cidr_block           = "172.31.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "Main VPC"
  }
}

resource "aws_subnet" "subnet_im" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "172.31.48.0/20"
  availability_zone_id    = "use1-az3"
  map_public_ip_on_launch = true
}

#######################
# S3 Buckets
#######################
resource "aws_s3_bucket" "backend_s3_config" {
  bucket = "backend-s3-config"

  tags = {
    Name = "backend-s3-config"
  }

  lifecycle {
    prevent_destroy = false
  }

  force_destroy = true
}

#######################
# IAM Roles and Policies
#######################
data "aws_iam_policy_document" "lambda_assume" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda_image_analysis" {
  name               = "ImageAnalysisLambdaRole"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_policy" "lambda_image_analysis_policy" {
  name = "ImageAnalysisPolicy"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect   = "Allow",
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetObjectMetadata",
          "s3:ListBucket"
        ],
        Effect   = "Allow",
        Resource = [
          "arn:aws:s3:::imagegallery-1-us-east-1",
          "arn:aws:s3:::imagegallery-1-us-east-1/*"
        ]
      },
      {
        Action = [
          "rekognition:DetectLabels",
          "rekognition:DetectFaces",
          "rekognition:DetectText"
        ],
        Effect   = "Allow",
        Resource = "*"
      },
      {
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ],
        Effect   = "Allow",
        Resource = "arn:aws:dynamodb:us-east-1:*:table/ImageLabels"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_image_analysis_attach" {
  role       = aws_iam_role.lambda_image_analysis.name
  policy_arn = aws_iam_policy.lambda_image_analysis_policy.arn
}

#######################
# DynamoDB Table
#######################
resource "aws_dynamodb_table" "image_labels" {
  name         = "ImageLabels"
  billing_mode = "PAY_PER_REQUEST"

  attribute {
    name = "ImageKey"
    type = "S"
  }

  hash_key = "ImageKey"

  tags = {
    Name = "ImageLabels"
  }
}

#######################
# Lambda Functions
#######################
variable "lambda_code_s3_bucket" {}
variable "lambda_code_s3_key" {}
variable "lambda_code_s3_object_version" {}

resource "aws_lambda_function" "image_analysis" {
  function_name = "ImageAnalysisFunction"
  role          = aws_iam_role.lambda_image_analysis.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.9"
  timeout       = 30
  memory_size   = 128
  architectures = ["x86_64"]

  s3_bucket         = var.lambda_code_s3_bucket
  s3_key            = var.lambda_code_s3_key
  s3_object_version = var.lambda_code_s3_object_version

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.image_labels.name
      REGION         = "us-east-1"
    }
  }

  ephemeral_storage {
    size = 512
  }
}

#######################
# ECS Task Definition
#######################
resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "ecsTaskExecutionRole"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
  ]

  inline_policy {
    name = "s3-config-policy"
    policy = jsonencode({
      Version = "2012-10-17",
      Statement = [
        {
          Sid      = "Statement1",
          Effect   = "Allow",
          Action   = ["s3:GetObject"],
          Resource = ["arn:aws:s3:::backend-s3-config/*"]
        }
      ]
    })
  }
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "definizione-processo-aws-backend"
  requires_compatibilities = ["EC2"]
  network_mode             = "bridge"
  memory                   = "384"
  cpu                      = "200"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "aws-backend",
      image     = "839351546441.dkr.ecr.us-east-1.amazonaws.com/awscloud/project:c7a5d1f",
      cpu       = 100,
      memory    = 384,
      essential = true,
      portMappings = [
        {
          containerPort = 8000,
          hostPort      = 8000,
          protocol      = "tcp",
          name          = "aws-backend-800-tcp"
        }
      ],
      environmentFiles = [
        {
          type  = "s3",
          value = "arn:aws:s3:::backend-s3-config/.env"
        }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = "/ecs/definizione-processo-aws-backend",
          awslogs-region        = "us-east-1",
          awslogs-stream-prefix = "ecs",
          awslogs-create-group  = "true",
          mode                  = "non-blocking",
          max-buffer-size       = "25m"
        }
      }
    }
  ])
}
