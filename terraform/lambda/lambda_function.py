import boto3
import json
from datetime import datetime
import urllib.parse
from decimal import Decimal

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('ImageLabels')

def lambda_handler(event, context):
    print("Evento ricevuto:", json.dumps(event, indent=2))
    
    # Estrai informazioni dall'evento S3
    try:
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
        
        print(f"Bucket: {bucket}")
        print(f"Key originale: {key}")
        
        # Verifica che sia un'immagine supportata
        supported_formats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
        if not any(key.lower().endswith(fmt) for fmt in supported_formats):
            print(f"Formato file non supportato: {key}")
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Formato file non supportato'})
            }
        
        # Inizializza client Rekognition
        rekognition = boto3.client('rekognition', region_name='us-east-1')
        s3_client = boto3.client('s3', region_name='us-east-1')
        
        # Verifica che l'oggetto esista
        try:
            s3_client.head_object(Bucket=bucket, Key=key)
            print(f"Oggetto S3 trovato: s3://{bucket}/{key}")
        except Exception as e:
            print(f"Oggetto S3 non trovato: {e}")
            return {
                'statusCode': 404,
                'body': json.dumps({'error': f'Oggetto non trovato: {str(e)}'})
            }
        
        print(f" Inizio analisi immagine: s3://{bucket}/{key}")
        
        # Analizza l'immagine con Rekognition
        response = rekognition.detect_labels(
            Image={
                'S3Object': {
                    'Bucket': bucket,
                    'Name': key
                }
            },
            MaxLabels=15,
            MinConfidence=70
        )
        
        # Estrai i label - CORREZIONE: Converti float in Decimal per DynamoDB
        labels = []
        label_names = []
        for label in response['Labels']:
            # Converti la confidenza da float a Decimal
            confidence_value = Decimal(str(round(label['Confidence'], 2)))
            
            labels.append({
                'Name': label['Name'],
                'Confidence': confidence_value
            })
            label_names.append(label['Name'])
        
        print(f"Labels trovati ({len(labels)}):", label_names)
        
        # Salva i risultati in DynamoDB - CORREZIONE: Tutti i valori numerici come Decimal
        item = {
            'ImageKey': key,
            'Bucket': bucket,
            'Labels': labels,
            'LabelNames': label_names,  # Solo i nomi per ricerca
            'Timestamp': datetime.utcnow().isoformat(),
            'TotalLabels': Decimal(len(labels)),  # Converti in Decimal
            'ProcessedBy': 'ImageAnalysisFunction'
        }
        
        table.put_item(Item=item)
        print(f"Dati salvati in DynamoDB per: {key}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Analisi completata con successo',
                'imageKey': key,
                'bucket': bucket,
                'labelsFound': len(labels),
                'labels': label_names
            })
        }

    except Exception as e:
        error_msg = f"Errore durante l'analisi: {str(e)}"
        print(f" {error_msg}")
        
        # Log dettagliato dell'errore
        import traceback
        print("Stack trace completo:")
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': error_msg,
                'imageKey': key if 'key' in locals() else 'unknown',
                'bucket': bucket if 'bucket' in locals() else 'unknown'
            })
        }
