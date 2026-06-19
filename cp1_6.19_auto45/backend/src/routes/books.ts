import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  totalPages: number;
  status: "unread" | "reading" | "read";
  startDate?: string;
  endDate?: string;
  rating?: number;
}

const books: Book[] = [
  {
    id: uuidv4(),
    title: "三体",
    author: "刘慈欣",
    coverUrl: "https://picsum.photos/seed/book1/200/300",
    totalPages: 302,
    status: "read",
    startDate: "2024-01-15",
    endDate: "2024-02-10",
    rating: 5
  },
  {
    id: uuidv4(),
    title: "活着",
    author: "余华",
    coverUrl: "https://picsum.photos/seed/book2/200/300",
    totalPages: 191,
    status: "read",
    startDate: "2024-03-01",
    endDate: "2024-03-15",
    rating: 4.5
  },
  {
    id: uuidv4(),
    title: "百年孤独",
    author: "加西亚·马尔克斯",
    coverUrl: "https://picsum.photos/seed/book3/200/300",
    totalPages: 360,
    status: "reading",
    startDate: "2024-05-20"
  },
  {
    id: uuidv4(),
    title: "小王子",
    author: "安托万·德·圣-埃克苏佩里",
    coverUrl: "https://picsum.photos/seed/book4/200/300",
    totalPages: 97,
    status: "reading",
    startDate: "2024-06-01"
  },
  {
    id: uuidv4(),
    title: "人类简史",
    author: "尤瓦尔·赫拉利",
    coverUrl: "https://picsum.photos/seed/book5/200/300",
    totalPages: 440,
    status: "unread"
  },
  {
    id: uuidv4(),
    title: "围城",
    author: "钱钟书",
    coverUrl: "https://picsum.photos/seed/book6/200/300",
    totalPages: 359,
    status: "unread"
  }
];

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json(books);
});

router.get("/:id", (req: Request, res: Response) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  res.json(book);
});

router.post("/", (req: Request, res: Response) => {
  const { title, author, coverUrl, totalPages, status, startDate, endDate, rating } = req.body;
  
  if (!title || !author || !totalPages) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const newBook: Book = {
    id: uuidv4(),
    title,
    author,
    coverUrl: coverUrl || "",
    totalPages,
    status: status || "unread",
    startDate,
    endDate,
    rating
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

router.put("/:id", (req: Request, res: Response) => {
  const bookIndex = books.findIndex(b => b.id === req.params.id);
  if (bookIndex === -1) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  const { title, author, coverUrl, totalPages, status, startDate, endDate, rating } = req.body;

  books[bookIndex] = {
    ...books[bookIndex],
    title: title || books[bookIndex].title,
    author: author || books[bookIndex].author,
    coverUrl: coverUrl !== undefined ? coverUrl : books[bookIndex].coverUrl,
    totalPages: totalPages || books[bookIndex].totalPages,
    status: status || books[bookIndex].status,
    startDate: startDate !== undefined ? startDate : books[bookIndex].startDate,
    endDate: endDate !== undefined ? endDate : books[bookIndex].endDate,
    rating: rating !== undefined ? rating : books[bookIndex].rating
  };

  res.json(books[bookIndex]);
});

router.delete("/:id", (req: Request, res: Response) => {
  const bookIndex = books.findIndex(b => b.id === req.params.id);
  if (bookIndex === -1) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  const deletedBook = books.splice(bookIndex, 1)[0];
  res.json(deletedBook);
});

export default router;
export { books, Book };
