import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import AuctionCard from './modules/auction/auctionCard';

const mockAuctions = [
  {
    id: '1',
    name: '清代青花瓷瓶',
    description: '乾隆年间官窑青花瓷瓶，保存完好，釉色温润',
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    currentPrice: 1250000,
    endTime: Date.now() + 3600 * 1000 * 2,
  },
  {
    id: '2',
    name: '名家山水画',
    description: '近现代著名画家作品，意境深远，笔墨精妙',
    coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop',
    currentPrice: 0,
    endTime: Date.now() + 3600 * 1000 * 24,
  },
];

function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        珍品拍卖
      </div>
      <div className="navbar-links">
        <Link to="/">首页</Link>
        <Link to="/create">发布拍卖</Link>
        <div className="navbar-user">
          <span className="navbar-username">游客</span>
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  return (
    <div className="container">
      <h1 className="page-title">热门拍卖</h1>
      <div className="auction-grid">
        {mockAuctions.map((auction) => (
          <AuctionCard
            key={auction.id}
            id={auction.id}
            name={auction.name}
            description={auction.description}
            coverImage={auction.coverImage}
            currentPrice={auction.currentPrice}
            endTime={auction.endTime}
          />
        ))}
      </div>
    </div>
  );
}

function AuctionDetailPage() {
  return (
    <div className="container">
      <h1 className="page-title">拍卖详情</h1>
      <p style={{ color: 'var(--text-muted)' }}>详情页开发中...</p>
    </div>
  );
}

function CreateAuctionPage() {
  return (
    <div className="container">
      <h1 className="page-title">发布拍卖</h1>
      <p style={{ color: 'var(--text-muted)' }}>发布页开发中...</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auction/:id" element={<AuctionDetailPage />} />
        <Route path="/create" element={<CreateAuctionPage />} />
      </Routes>
    </div>
  );
}
