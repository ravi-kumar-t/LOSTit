// src/dynamoService.js

 import { v4 as uuidv4 } from 'uuid'; 
 import { Auth } from 'aws-amplify'; 

 // --- IMPORTANT:  API GATEWAY INVOKE URLs  --- 
 const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
 const API_GALLERY_URL = `${API_BASE_URL}/items`; 
 const API_UPLOAD_URL = `${API_BASE_URL}/upload`; 
 const API_PRESIGNED_URL_GENERATOR = `${API_BASE_URL}/presigned-url`; 
 const API_VERIFY_BASE_URL = `${API_BASE_URL}/verify`; 
 const API_USER_ITEMS_BASE_URL = `${API_BASE_URL}/user/items`; 

 // Helper to get authenticated user token 
 async function getAuthToken() { 
     try { 
         const session = await Auth.currentSession(); 
         return session.getIdToken().getJwtToken(); 
     } catch (authError) { 
         console.error("Error getting Amplify user session/token:", authError); 
         return null;
     } 
 } 

 // Function to save a new item (handles presigned URL for image upload and DynamoDB save) 
 export const saveItemToDynamoDB = async (itemData, imageFile) => { 
     const userToken = await getAuthToken(); 

     let imageUrl = null; 
     let newVerificationCode = null; 

     if (imageFile) { 
         try { 
             console.log(`Requesting presigned URL from: ${API_PRESIGNED_URL_GENERATOR}`); 
             const presignedUrlResponse = await fetch( 
                 `${API_PRESIGNED_URL_GENERATOR}?fileName=${encodeURIComponent(imageFile.name)}&fileType=${encodeURIComponent(imageFile.type)}&itemType=${encodeURIComponent(itemData.itemType)}`, 
                 { 
                     headers: { 
                         'Authorization': `Bearer ${userToken}` 
                     } 
                 } 
             ); 

             if (!presignedUrlResponse.ok) { 
                 const errorData = await presignedUrlResponse.json(); 
                 throw new Error(`Failed to get presigned URL: ${errorData.message || 'Unknown error'}`); 
             } 

             const { uploadUrl, fileUrl: receivedImageUrl } = await presignedUrlResponse.json(); 
             imageUrl = receivedImageUrl; 
             console.log("Received presigned URL:", uploadUrl); 
             console.log("Expected public image URL:", imageUrl); 

             console.log("Uploading image directly to S3..."); 
             const s3UploadResponse = await fetch(uploadUrl, { 
                 method: 'PUT', 
                 headers: { 
                     'Content-Type': imageFile.type, 
                 }, 
                 body: imageFile, 
             }); 

             if (!s3UploadResponse.ok) { 
                 const errorText = await s3UploadResponse.text(); 
                 if (errorText.startsWith('<?xml')) { 
                     const parser = new DOMParser(); 
                     const xmlDoc = parser.parseFromString(errorText, "text/xml"); 
                     const errorMessage = xmlDoc.getElementsByTagName("Message")[0]?.textContent || errorText; 
                     throw new Error(`Failed to upload image to S3: ${s3UploadResponse.status} ${s3UploadResponse.statusText} - ${errorMessage}`); 
                 } else { 
                     throw new Error(`Failed to upload image to S3: ${s3UploadResponse.status} ${s3UploadResponse.statusText} - ${errorText}`); 
                 } 
             } 
             console.log("Image successfully uploaded to S3!"); 

         } catch (error) { 
             console.error("Error during image upload process:", error); 
             throw error; 
         } 
     } else { 
         console.log("No image file provided for upload."); 
         throw new Error("An image file is required for item upload."); 
     } 

     const dataToSend = { 
         itemId: uuidv4(), 
         status: "active", 
         itemName: itemData.itemName, 
         description: itemData.description, 
         location: itemData.location, 
         createdAt: itemData.dateLost, 
         itemType: itemData.itemType, 
         imageUrl: imageUrl 
     }; 

     console.log("Data being sent to /upload:", dataToSend); 

     try { 
         console.log(`Saving item metadata to: ${API_UPLOAD_URL}`); 
         const response = await fetch(API_UPLOAD_URL, { 
             method: 'POST', 
             headers: { 
                 'Content-Type': 'application/json', 
                 'Authorization': `Bearer ${userToken}` 
             }, 
             body: JSON.stringify(dataToSend), 
         }); 

         if (!response.ok) { 
             const errorBody = await response.json(); 
             throw new Error(errorBody.message || `HTTP error! status: ${response.status}`); 
         } 

         const result = await response.json(); 
         console.log("Item metadata saved successfully (via API Gateway)!", result); 
         newVerificationCode = result.verificationCode; 
         return { itemId: dataToSend.itemId, verificationCode: newVerificationCode }; 
     } catch (error) { 
         console.error("Error saving item metadata via API Gateway:", error); 
         throw error; 
     } 
 }; 

 export const getLostItemsFromDynamoDB = async () => { 
     try { 
         console.log(`Fetching gallery items from: ${API_GALLERY_URL}`); 
         const response = await fetch(API_GALLERY_URL); 

         if (!response.ok) { 
             const errorBody = await response.json(); 
             throw new Error(errorBody.message || `HTTP error! status: ${response.status}`); 
         } 

         const data = await response.json(); 
         console.log("Parsed data in frontend dynamoService (Gallery):", data); 
         return data; 
     } catch (error) { 
         console.error("Error fetching items from API Gateway (Gallery):", error); 
         return []; 
     } 
 }; 

 export const getUploadedItemsFromDynamoDB = async () => { 
     const userToken = await getAuthToken(); 
     if (!userToken) {
         throw new Error("User not authenticated for fetching uploaded items."); 
     } 

     try { 
         const url = `${API_USER_ITEMS_BASE_URL}?type=uploaded`; 
         console.log(`Fetching user's uploaded items from: ${url}`); 
         const response = await fetch(url, { 
             method: 'GET', 
             headers: { 
                 'Content-Type': 'application/json', 
                 'Authorization': `Bearer ${userToken}` 
             }, 
         }); 

         if (!response.ok) { 
             const errorBody = await response.json(); 
             if (response.status === 401 || response.status === 403) { 
                 throw new Error("Unauthorized to view your uploaded items. Please ensure you are logged in correctly."); 
             } 
             throw new Error(errorBody.message || `HTTP error! status: ${response.status}`); 
         } 

         const data = await response.json(); 
         console.log("Parsed data in frontend dynamoService (User Uploaded Items):", data); 
         return data; 
     } catch (error) { 
         console.error("Error fetching user uploaded items via API Gateway:", error); 
         throw error; 
     } 
 }; 

 export const getClaimedItemsFromDynamoDB = async () => { 
     const userToken = await getAuthToken(); 
     if (!userToken) {
         throw new Error("User not authenticated for fetching claimed items."); 
     } 

     try { 
         const url = `${API_USER_ITEMS_BASE_URL}?type=claimed`; 
         console.log(`Fetching user's claimed items from: ${url}`); 
         const response = await fetch(url, { 
             method: 'GET', 
             headers: { 
                 'Content-Type': 'application/json', 
                 'Authorization': `Bearer ${userToken}` 
             }, 
         }); 

         if (!response.ok) { 
             const errorBody = await response.json(); 
             if (response.status === 401 || response.status === 403) { 
                 throw new Error("Unauthorized to view your claimed items. Please ensure you are logged in correctly."); 
             } 
             throw new Error(errorBody.message || `HTTP error! status: ${response.status}`); 
         } 

         const data = await response.json(); 
         console.log("Parsed data in frontend dynamoService (User Claimed Items):", data); 
         return data; 
     } catch (error) { 
         console.error("Error fetching user claimed items via API Gateway:", error); 
         throw error; 
     } 
 }; 

 // Function to get a single item by verification code (public access for verification link) 
 // This function needs to handle if the endpoint is authenticated or not. 
 export const getLostItemByVerificationCode = async (verificationCode) => { 
     const url = `${API_VERIFY_BASE_URL}/${encodeURIComponent(verificationCode)}`; 
      
     try { 
         console.log(`Verifying item from: ${url}`); 
         const userToken = await getAuthToken();

         const headers = { 'Content-Type': 'application/json' }; 
         if (userToken) { 
             headers['Authorization'] = `Bearer ${userToken}`; 
         } 

         const response = await fetch(url, { headers: headers });

         if (!response.ok) { 
             const errorBody = await response.json(); 
             throw new Error(errorBody.message || `HTTP error! status: ${response.status}`); 
         } 

         const data = await response.json(); 
         console.log("Verification result:", data); 
         return data; 
     } catch (error) { 
         console.error("Error verifying item via API Gateway:", error); 
         throw error; 
     } 
 }; 

 // Function to claim an item 
 export const claimItem = async (verificationCode) => { 
     const userToken = await getAuthToken(); 
     if (!userToken) {
         throw new Error("User not authenticated. Please log in to claim an item."); 
     } 

     try { 
         const url = `${API_VERIFY_BASE_URL}/${encodeURIComponent(verificationCode)}/claim`; 
         console.log(`Attempting to claim item via: ${url}`); 
         const response = await fetch(url, { 
             method: 'POST', 
             headers: { 
                 'Content-Type': 'application/json', 
                 'Authorization': `Bearer ${userToken}` 
             }, 
             body: JSON.stringify({}) 
         }); 

         if (!response.ok) { 
             const errorBody = await response.json(); 
             throw new Error(errorBody.message || `Failed to claim item. Status: ${response.status}`); 
         } 

         const result = await response.json(); 
         console.log("Item claimed successfully:", result); 
         return result; 
     } catch (error) { 
         console.error("Error claiming item:", error); 
         throw error; 
     } 
 }; 

 // Function to confirm handover of an item (by the uploader) 
 export const confirmHandover = async (itemId) => { 
     const userToken = await getAuthToken(); 
     if (!userToken) {
         throw new Error("User not authenticated. Please log in to confirm handover."); 
     } 

     try { 
         const url = `${API_BASE_URL}/item/${encodeURIComponent(itemId)}/handover-confirm`; 
         console.log(`Attempting to confirm handover for item: ${itemId} via ${url}`); 
         const response = await fetch(url, { 
             method: 'POST', 
             headers: { 
                 'Content-Type': 'application/json', 
                 'Authorization': `Bearer ${userToken}` 
             }, 
             body: JSON.stringify({}) 
         }); 

         if (!response.ok) { 
             const errorBody = await response.json(); 
             throw new Error(errorBody.message || `Failed to confirm handover. Status: ${response.status}`); 
         } 

         const result = await response.json(); 
         console.log("Handover confirmed successfully:", result); 
         return result; 
     } catch (error) { 
         console.error("Error confirming handover:", error); 
         throw error; 
     } 
 };