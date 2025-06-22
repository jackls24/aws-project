import boto3
import os
import json
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Carica le variabili d'ambiente
load_dotenv()

# Configurazione
AWS_REGION = os.getenv('AWS_REGION')
BUCKET_NAME = os.getenv('S3_BUCKET_NAME')
ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')

def test_s3_permissions():
    """
    Verifica i permessi dell'utente IAM sul bucket S3 specificato.
    """
    print(f"Teste permessi su bucket: {BUCKET_NAME} in regione: {AWS_REGION}")
    print(f"Usando access key: {ACCESS_KEY[:5]}...")

    try:
        # Crea un client S3
        s3_client = boto3.client(
            's3',
            aws_access_key_id=ACCESS_KEY,
            aws_secret_access_key=SECRET_KEY,
            region_name=AWS_REGION
        )

        # Testa varie operazioni S3 per verificare i permessi
        operations = [
            {
                'name': 'ListBuckets',
                'func': lambda: s3_client.list_buckets()
            },
            {
                'name': f'HeadBucket ({BUCKET_NAME})',
                'func': lambda: s3_client.head_bucket(Bucket=BUCKET_NAME)
            },
            {
                'name': f'ListObjects ({BUCKET_NAME})',
                'func': lambda: s3_client.list_objects_v2(Bucket=BUCKET_NAME, MaxKeys=1)
            },
            {
                'name': f'GetBucketLocation ({BUCKET_NAME})',
                'func': lambda: s3_client.get_bucket_location(Bucket=BUCKET_NAME)
            }
        ]

        results = []
        for op in operations:
            try:
                result = op['func']()
                results.append({
                    'operation': op['name'],
                    'success': True,
                    'message': 'Operazione riuscita'
                })
                print(f"✅ {op['name']}: Successo")
            except ClientError as e:
                error_code = e.response['Error']['Code']
                error_msg = e.response['Error']['Message']
                results.append({
                    'operation': op['name'],
                    'success': False,
                    'error_code': error_code,
                    'error_message': error_msg
                })
                print(f"❌ {op['name']}: Fallito - {error_code}: {error_msg}")

        # Test di upload di un piccolo file
        try:
            test_key = "test-permissions.txt"
            s3_client.put_object(
                Bucket=BUCKET_NAME,
                Key=test_key,
                Body="Test di upload per verifica permessi",
                ContentType="text/plain"
            )
            results.append({
                'operation': f'PutObject ({test_key})',
                'success': True,
                'message': 'Operazione riuscita'
            })
            print(f"✅ PutObject ({test_key}): Successo")
            
            # Prova a eliminare il file di test
            s3_client.delete_object(Bucket=BUCKET_NAME, Key=test_key)
            results.append({
                'operation': f'DeleteObject ({test_key})',
                'success': True,
                'message': 'Operazione riuscita'
            })
            print(f"✅ DeleteObject ({test_key}): Successo")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_msg = e.response['Error']['Message']
            results.append({
                'operation': 'PutObject+DeleteObject (test file)',
                'success': False,
                'error_code': error_code,
                'error_message': error_msg
            })
            print(f"❌ PutObject/DeleteObject: Fallito - {error_code}: {error_msg}")

        # Stampa un riepilogo
        success_count = sum(1 for r in results if r['success'])
        print(f"\nRiepilogo: {success_count}/{len(results)} operazioni riuscite")
        
        # Suggerimenti basati sui risultati
        if any(not r['success'] and 'AccessDenied' in r.get('error_code', '') for r in results):
            print("\nSuggerimento: Sembra che tu non abbia permessi sufficienti. Verifica la policy IAM dell'utente.")
            print("Aggiungi questa policy all'utente IAM:")
            policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Action": [
                            "s3:ListBucket",
                            "s3:GetBucketLocation",
                            "s3:GetObject",
                            "s3:PutObject",
                            "s3:DeleteObject"
                        ],
                        "Resource": [
                            f"arn:aws:s3:::{BUCKET_NAME}",
                            f"arn:aws:s3:::{BUCKET_NAME}/*"
                        ]
                    }
                ]
            }
            print(json.dumps(policy, indent=4))

        if any(not r['success'] and 'NoSuchBucket' in r.get('error_code', '') for r in results):
            print(f"\nSuggerimento: Il bucket '{BUCKET_NAME}' non sembra esistere. Verifica il nome o crealo.")
            
        return results

    except Exception as e:
        print(f"Errore durante il test: {str(e)}")
        return None

if __name__ == "__main__":
    test_s3_permissions()
