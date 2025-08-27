import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Amplify, Logger } from 'aws-amplify';
import awsconfig from './aws-exports';

Logger.LOG_LEVEL = 'DEBUG'; 

Amplify.configure(awsconfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);