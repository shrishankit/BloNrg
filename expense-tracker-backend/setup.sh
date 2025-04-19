#!/bin/bash

# Project name
PROJECT_NAME="expense-tracker-backend"

# Step 1: Create folder and initialize project
mkdir $PROJECT_NAME && cd $PROJECT_NAME
npm init -y

# Step 2: Install dependencies
npm install express @prisma/client cors dotenv jsonwebtoken bcrypt
npm install -D typescript ts-node nodemon prisma \
  @types/express @types/node @types/jsonwebtoken @types/bcrypt

# Step 3: Initialize TypeScript
npx tsc --init

# Step 4: Configure tsconfig.json
cat > tsconfig.json <<EOL
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
EOL

# Step 5: Initialize Prisma
npx prisma init

# Set DATABASE_URL in .env
echo 'DATABASE_URL="file:./dev.db"' > .env

# Step 6: Create Prisma schema
cat > prisma/schema.prisma <<EOL
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id       Int       @id @default(autoincrement())
  username String    @unique
  email    String    @unique
  password String
  expenses Expense[]
}

model Expense {
  id          Int      @id @default(autoincrement())
  amount      Float
  category    String
  date        DateTime
  description String?
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      Int
}
EOL

# Step 7: Run initial Prisma migrate
npx prisma migrate dev --name init

# Step 8: Create folder structure
mkdir -p src/{routes,controllers,middleware,utils}
touch src/prisma.ts src/index.ts

# Step 9: Write src/prisma.ts
cat > src/prisma.ts <<EOL
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default prisma;
EOL

# Step 10: Write src/index.ts
cat > src/index.ts <<EOL
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './prisma';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
  res.json({ message: 'API is running!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
EOL

# Step 11: Add dev script
npx json -I -f package.json -e 'this.scripts={"dev":"nodemon src/index.ts"}'

echo "✅ Setup complete! To start the server:"
echo "cd $PROJECT_NAME && npm run dev"
