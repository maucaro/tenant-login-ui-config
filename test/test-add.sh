TENANT_UI_CONFIG="{
        \"displayName\": \"Auth0\",
        \"iconUrl\": \"https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/anonymous.png\",
        \"logoUrl\": \"\",
        \"buttonColor\": \"#007bff\",
        \"immediateFederatedRedirect\": true,
        \"signInFlow\": \"redirect\",
        \"signInOptions\": [
          {
            \"provider\": \"password\",
            \"disableSignUp\": {
              \"status\": true
            }
          }
        ],
        \"tosUrl\": \"\",
        \"privacyPolicyUrl\": \"\"
      }"
curl http://localhost:8080 -H "Content-Type:application/json" -d "{\"operation\":\"add\",\"tenantId\":\"auth0mm-12345\", \"tenantUiConfig\":${TENANT_UI_CONFIG}}"