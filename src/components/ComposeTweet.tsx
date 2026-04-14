import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { tweetApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Props {
  onTweetCreated: () => void;
}

const ComposeTweet = ({ onTweetCreated }: Props) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;
    setLoading(true);
    try {
      await tweetApi.create({ content: content.trim(), userId: user.id });
      setContent("");
      onTweetCreated();
    } catch (err: any) {
      toast({ title: "Tweet gönderilemedi", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b border-border p-4">
      <div className="flex gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {user?.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Neler oluyor?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-none resize-none text-lg placeholder:text-muted-foreground focus-visible:ring-0 p-0 min-h-[80px]"
            maxLength={280}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-muted-foreground">{content.length}/280</span>
            <Button onClick={handleSubmit} disabled={!content.trim() || loading} size="sm" className="rounded-full px-5">
              {loading ? "Gönderiliyor..." : "Tweetle"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposeTweet;
