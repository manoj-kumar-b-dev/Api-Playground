import { Router, Request, Response } from "express";

const router = Router();

// 1. Simple Ping Endpoint
router.get("/ping", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "pong",
    timestamp: new Date().toISOString(),
  });
});

// 2. Echo Endpoint (Returns back method, headers, query params, body)
router.all("/echo", (req: Request, res: Response) => {
  res.status(200).json({
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    queryParams: req.query,
    body: req.body,
    timestamp: new Date().toISOString(),
  });
});

// 3. Sample Users Data (GET & POST)
const mockUsers = [
  { id: 1, name: "Manoj Kumar", email: "manoj@example.com", role: "Full Stack Developer" },
  { id: 2, name: "Anita Sharma", email: "anita@example.com", role: "UI/UX Designer" },
  { id: 3, name: "Alex Rivera", email: "alex@example.com", role: "DevOps Engineer" },
];

router.get("/users", (req: Request, res: Response) => {
  const { role } = req.query;
  if (role) {
    const filtered = mockUsers.filter(u => u.role.toLowerCase().includes(String(role).toLowerCase()));
    return res.status(200).json({ success: true, count: filtered.length, data: filtered });
  }
  res.status(200).json({ success: true, count: mockUsers.length, data: mockUsers });
});

router.post("/users", (req: Request, res: Response) => {
  const { name, email, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, error: "Name and email are required" });
  }
  const newUser = {
    id: mockUsers.length + 1,
    name,
    email,
    role: role || "Developer",
  };
  mockUsers.push(newUser);
  res.status(201).json({ success: true, message: "User created successfully", data: newUser });
});

// 4. Custom HTTP Status Code Tester
router.all("/status/:code", (req: Request, res: Response) => {
  const statusCode = parseInt(String(req.params.code), 10) || 200;
  res.status(statusCode).json({
    statusCode,
    message: `Response with status code ${statusCode}`,
    success: statusCode >= 200 && statusCode < 300,
  });
});

// 5. Response Delay / Latency Tester
router.get("/delay/:seconds", (req: Request, res: Response) => {
  const delaySec = Math.min(Math.max(parseInt(String(req.params.seconds), 10) || 1, 1), 10);
  setTimeout(() => {
    res.status(200).json({
      delayedSeconds: delaySec,
      message: `Response delayed by ${delaySec} seconds`,
    });
  }, delaySec * 1000);
});

// 6. Protected Bearer Token Endpoint Mock
router.get("/protected", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Missing or invalid Bearer token in Authorization header" });
  }
  const token = authHeader.split(" ")[1];
  res.status(200).json({
    success: true,
    message: "Authorized access granted!",
    tokenReceived: token,
  });
});

export default router;
