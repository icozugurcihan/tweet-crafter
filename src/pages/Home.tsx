import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { tweetApi, Tweet } from "@/lib/api";
import ComposeTweet from "@/components/ComposeTweet";
import TweetCard from "@/components/TweetCard";
import Sidebar from "@/components/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";

const Home = () => {
  const { user } = useAuth();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTweets = async () => {
    if (!user) return;
    try {
      const data = await tweetApi.findByUserId(user.id);
      setTweets(Array.isArray(data) ? data : []);
    } catch {
      setTweets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, [user]);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-shrink-0 sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Main Feed */}
      <main className="flex-1 max-w-2xl border-x border-border min-h-screen">
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border p-4 z-10">
          <h1 className="text-xl font-bold text-foreground">Ana Sayfa</h1>
        </div>

        <ComposeTweet onTweetCreated={fetchTweets} />

        {loading ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : tweets.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-lg">Henüz tweet yok</p>
            <p className="text-sm mt-1">İlk tweetini paylaş!</p>
          </div>
        ) : (
          tweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} onRefresh={fetchTweets} />
          ))
        )}
      </main>

      {/* Right panel placeholder */}
      <div className="hidden lg:block w-80 flex-shrink-0 p-4">
        <div className="bg-muted rounded-2xl p-4">
          <h2 className="font-bold text-lg text-foreground mb-3">CORS Bilgisi</h2>
          <p className="text-sm text-muted-foreground">
            Bu uygulama <code className="text-primary">localhost:5173</code> üzerinden çalışıyor. 
            Backend <code className="text-primary">localhost:3000</code>'de çalışırken CORS hatasıyla karşılaşabilirsiniz. 
            Backend'de CORS ayarlarını yapılandırmanız gerekir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
