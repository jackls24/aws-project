
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
  region = "us-east-2"
  profile = "giacomo1000"

}

#######################
# Roles
#######################
resource "aws_iam_service_linked_role" "ecs" {
  aws_service_name = "ecs.amazonaws.com"
}

#######################
# VPC & SubnetsDamm
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
  availability_zone_id    = "use2-az1"
  map_public_ip_on_launch = true
}

#######################
# S3 Buckets
#######################
resource "aws_s3_bucket" "backend_s3_config" {
  bucket = "backend-s3-config-giacomo1000"

  tags = {
    Name = "backend-s3-config-2"
  }

  force_destroy = true

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
      bucket_key_enabled = true
    }
  }

  # Blocchi rimossi per compatibilità provider
}

resource "aws_s3_bucket_policy" "backend_s3_config_policy" {
  bucket = aws_s3_bucket.backend_s3_config.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: {
          AWS: "arn:aws:iam::839351546441:role/ecsTaskExecutionRole"
        },
        Action: "s3:GetObject",
        Resource: "arn:aws:s3:::backend-s3-config-giacomo1000/*"
      }
    ]
  })
}

resource "aws_s3_bucket" "frontend_gallery" {
  bucket = "frontend-gallery-bucket-giacomo1000"

  website {
    index_document = "index.html"
    error_document = "index.html"
  }

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = [
      "http://frontend-gallery-bucket.s3-website-us-east-1.amazonaws.com",
      "https://frontend-gallery-bucket.s3-website-us-east-1.amazonaws.com"
    ]
    expose_headers = ["ETag"]
    max_age_seconds = 3000
  }

  force_destroy = true

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
      bucket_key_enabled = true
    }
  }


}

resource "aws_s3_bucket_policy" "frontend_gallery_policy" {
  bucket = aws_s3_bucket.frontend_gallery.id

  policy = jsonencode({
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: "*",
        Action: "s3:GetObject",
        Resource: "arn:aws:s3:::frontend-gallery-bucket-giacomo1000/*"
      }
    ]
  })
}

resource "aws_s3_bucket" "imagegallery" {
  bucket = "imagegallery-giacomo1000"

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = [
      "http://localhost:3000",
      "https://localhost:3000",
      "https://localhost:8000"
    ]
    expose_headers = ["ETag"]
    max_age_seconds = 3000
  }

  force_destroy = true

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }


}

resource "aws_s3_bucket_notification" "imagegallery_lambda_trigger" {
  bucket = aws_s3_bucket.imagegallery.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.image_analysis.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "users/"
  }

  depends_on = [aws_lambda_permission.image_analysis_invocation]
}

resource "aws_s3_bucket_policy" "imagegallery_policy" {
  bucket = aws_s3_bucket.imagegallery.id

  policy = jsonencode({
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: "*",
        Action: "*",
        Resource: "arn:aws:s3:::imagegallery-giacomo1000/*"
      }
    ]
  })
}

resource "aws_lambda_permission" "image_analysis_invocation" {
  statement_id  = "AllowExecutionFromS3"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.image_analysis.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.imagegallery.arn
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
# Lambda Functions (local ZIP version)
#######################
resource "aws_lambda_function" "image_analysis" {
  function_name = "ImageAnalysisFunction"
  role          = aws_iam_role.lambda_image_analysis.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.9"
  timeout       = 30
  memory_size   = 128
  architectures = ["x86_64"]

  filename         = "${path.module}/lambda/image_analysis.zip"
  source_code_hash = filebase64sha256("${path.module}/lambda/image_analysis.zip")

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


resource "aws_ecs_cluster" "my_cluster" {
  name = "my-ec2-cluster-4" 

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

 resource "aws_ecs_cluster_capacity_providers" "example" {
  cluster_name = aws_ecs_cluster.my_cluster.name

  capacity_providers = [aws_ecs_capacity_provider.asg_provider.name]

  default_capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.asg_provider.name
    weight            = 1
    base              = 0
  }
}



# Instance profile per ECS
resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "ecsInstanceRole"
  role = aws_iam_role.ecs_instance_role.name
}

# Ruolo IAM per ECS instances (se non già presente)
resource "aws_iam_role" "ecs_instance_role" {
  name = "ecsInstanceRole"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "ec2.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
  ]
}

resource "aws_launch_template" "ecs_launch_template" {
  name_prefix   = "ecs-launch-template-"
  image_id      = "ami-0ee4f2271a4df2d7d" # Amazon ECS-optimized AMI for us-east-2
  instance_type = "t3.micro"

  iam_instance_profile {
    name = aws_iam_instance_profile.ecs_instance_profile.name
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              echo ECS_CLUSTER=my-ec2-cluster-4 >> /etc/ecs/ecs.config
              EOF
            )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "ecs-instance"
    }
  }
}

resource "aws_autoscaling_group" "ecs_asg" {
  name                      = "ecs-asg-my-ec2-cluster-4"
  max_size                  = 5
  min_size                  = 2
  desired_capacity          = 3
  vpc_zone_identifier       = [aws_subnet.subnet_im.id]
  health_check_type         = "EC2"
  launch_template {
    id      = aws_launch_template.ecs_launch_template.id
    version = "$Latest"
  }
  protect_from_scale_in = true
  tag {
    key                 = "AmazonECSManaged"
    value               = "true"
    propagate_at_launch = true
  }
}

resource "aws_ecs_capacity_provider" "asg_provider" {
  name = "asg-provider"

  auto_scaling_group_provider {
    auto_scaling_group_arn         = aws_autoscaling_group.ecs_asg.arn
    managed_termination_protection = "ENABLED"

    managed_scaling {
      status                    = "ENABLED"
      target_capacity           = 100
      minimum_scaling_step_size = 1
      maximum_scaling_step_size = 1000
    }
  }
}

resource "aws_ecs_service" "backend_service" {
  name            = "aws-backend-service"
  cluster         = aws_ecs_cluster.my_cluster.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 3

  capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.asg_provider.name
    weight            = 1
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  lifecycle {
    ignore_changes = [task_definition] # utile se aggiorni la task fuori da Terraform
  }
}

