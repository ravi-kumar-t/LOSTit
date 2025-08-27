// src/aws-exports.js 
 const awsConfig = { 
   Auth: { 
     region: process.env.REACT_APP_AWS_REGION,
     userPoolId: process.env.REACT_APP_USER_POOL_ID,
     userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID,
     oauth: { 
       domain: process.env.REACT_APP_COGNITO_DOMAIN,
       scope: ['openid', 'email', 'profile'], 
       redirectSignIn: 'https://localhost:3000/callback', 
       redirectSignOut: 'https://localhost:3000/', 
       responseType: 'code', 
     } 
   } 
 }; 

 export default awsConfig;