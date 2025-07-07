# Your Memories

Your Memories is a full-stack web application that allows users to create and explore travel memories.

It is designed for travel enthusiasts who want to share their experiences and also discover destinations based on real recommendations from others.

---

## Table of Contents

- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Motivation](#motivation)
- [Screenshots](#screenshots)
- [Feedback](#feedback)

---

## Live Demo

https://your-memories.onrender.com

---

## Features

- Share personal travel memories with title, description, tags, and an image  
- JWT-based login and registration system  
- View memories shared by other users  
- Save memories you like after logging in  
- Responsive and user-friendly interface using ReactJS  
- RESTful APIs for smooth communication between frontend and backend  
- MongoDB integration for efficient storage and fast retrieval of data  

---

## Tech Stack

| Layer      | Technology         |
|------------|--------------------|
| Frontend   | ReactJS            |
| Backend    | NodeJS, ExpressJS  |
| Database   | MongoDB            |
| Auth       | JSON Web Tokens    |
| Hosting    | Render             |

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/anurag2118/your-memories.git
cd your-memories
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` folder and add the following:

```
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
```

Then run the backend server:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd ../client
npm install
npm start
```

The app will be running at `http://localhost:3000`

---

## Motivation

I’ve always enjoyed traveling, but finding good places to visit was often challenging.  
Your Memories helps solve that by letting people share their travel experiences and also discover new destinations based on others’ real stories.  
Users can also save their own memories for future reference, available only after logging in.

---

## Screenshots

### Login Page
![Login Page](images/login-page.png)

### Explore Memories
![Explore Memories](images/memories.png)

---

## Feedback

If you have suggestions or want to report a bug, feel free to open an issue or reach out directly.

---
