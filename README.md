# LOSTit 📱

### A Modern Lost & Found Web Application

LOSTit is a web application designed to help users find and return lost items. It provides a simple, secure platform for users to report lost or found items, view a public gallery of items, and securely claim their belongings. The application leverages a serverless architecture, ensuring scalability and cost-effectiveness.

## 🌟 Features

* **Secure Authentication:** User login and registration are handled via AWS Amplify and Amazon Cognito, ensuring a secure and reliable authentication process.
* **Item Management:** Users can upload details of lost or found items, including images, descriptions, and location.
* **Public Gallery:** A public-facing gallery displays all active lost and found items, allowing anyone to view what has been reported.
* **Item Verification:** Each uploaded item generates a unique verification code and QR code. This allows the original owner to verify an item without exposing personal contact information.
* **Item Claiming:** Authenticated users can securely claim an item, initiating a handover process that connects the original uploader with the claimant.
* **Serverless Architecture:** The backend is built using AWS services (Lambda, API Gateway, DynamoDB, S3), providing a highly scalable and maintenance-free solution.

---

## 💻 Tech Stack

* **Frontend:** React, React Router, Tailwind CSS
* **Backend:** Node.js, AWS Lambda, Amazon API Gateway
* **Database:** Amazon DynamoDB
* **Storage:** Amazon S3 for image hosting
* **Authentication:** AWS Amplify, Amazon Cognito

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher)
* npm
* An AWS account with configured credentials
* The AWS Amplify CLI (`npm install -g @aws-amplify/cli`)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/ravi-kumar-t/LOSTit.git](https://github.com/ravi-kumar-t/LOSTit.git)
    cd LOSTit
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Application

To run the application in development mode:
```bash
npm run start
