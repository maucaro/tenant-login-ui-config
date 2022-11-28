# Cloud Functions deployment script
# Update environment variables to suit your needs
REGION='us-central1'
SA=''
AUTH_HOST=''
gcloud functions deploy iap-webui-update-config \
--gen2 \
--runtime=nodejs16 \
--region=$REGION \
--source=. \
--entry-point=updateConfig \
--trigger-http \
--run-service-account=$SA \
--set-env-vars=AUTH_HOST=$AUTH_HOST \
--max-instances=1 
