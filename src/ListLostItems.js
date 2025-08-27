import React, { useEffect, useState } from 'react';
import { getLostItemsFromDynamoDB } from './dynamoService';

function ListLostItems() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchItems() {
      const data = await getLostItemsFromDynamoDB(); 
      setItems(data);
    }
    fetchItems();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Lost Items Dashboard</h2>
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "20px", 
        justifyContent: "center" 
      }}>
        {items.map((item) => (
          <div 
            key={item.itemId}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              width: "250px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
            }}
          >
            <img 
              src={item.imageUrl} 
              alt={item.itemName} 
              style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
            />
            <h3 style={{ marginTop: "10px" }}>{item.itemName}</h3>
            <p><b>Location:</b> {item.location}</p>
            <p><b>Date Lost:</b> {item.dateLost}</p>
            <p style={{ fontSize: "14px", color: "gray" }}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListLostItems;
