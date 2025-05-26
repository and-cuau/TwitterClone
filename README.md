# X Clone
This application is designed to mimic the core functionality of X.

## Technologies Used  
- **Frontend**: React, HTML, CSS, Javascript
- **Backend**: Javascript, Node.js, Express.js, SQLite3
- **Real-Time Communication**: WebSocket
- **Security**: JWT, Bcrypt

## Features & Functionality  
- **Routing**: Implements dynamic routing using React Router to navigate between different pages of the app.
- **Components**: Utilizes React components to build reusable UI elements. Certain pages and features are encapsulated in their own component, improving maintainability and readability of the code.
- **Passing Props**: Components communicate and share data through props, allowing for dynamic content rendering and a smooth user experience. For example, the main page component passes data to child components to display relevant content.  
- **Context**: Shares and persists user information across routes using React context.  
- **Local Storage**: Persists user information and session tokens across page refreshes using localStorage API.  
- **Dynamic Component Rendering**: Conditionally renders components based on user role and state. Renders components based on API responses.  
- **Direct Messaging**: Built a user-to-user direct messaging interface with real-time message updates  
- **Role-based JWT Authentication**: Utilizes server-generated tokens to authenticate client actions throughout login session. Users and Admin have different allowed actions.  
- **Secure Password Storage**: Passwords are hashed before storage on signup. Hashed input password is compared to stored hash on login.
- **Non-Repudiation**: User actions are logged with action-specific details to prevent denial of having performed action.  

## Challenges & Solutions  
- **Challenge**:  Enabling two-way communication between two connnected clients.  
  **Solution**: Implemented map of WebSocket connection instances addressed by user ID. 

## Future Improvements  
- Plan to store direct messages in database for long-term storage and retrieval.
