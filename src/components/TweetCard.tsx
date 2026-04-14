import { useState } from "react";
import { Tweet, commentApi, likeApi, retweetApi, tweetApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Repeat2, Trash2, Pencil } from "lucide-react";

interface Props {
  tweet: Tweet;
  onRefresh: () => void;
}

const TweetCard = ({ tweet, onRefresh }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(tweet.content);

  const isOwner = user?.id === tweet.userId;

  const handleLike = async () => {
    if (!user) return;
    try {
      await likeApi.like({ userId: user.id, tweetId: tweet.id });
      onRefresh();
    } catch {
      // maybe already liked, try dislike
      try {
        await likeApi.dislike({ userId: user.id, tweetId: tweet.id });
        onRefresh();
      } catch (err: any) {
        toast({ title: "Hata", description: err.message, variant: "destructive" });
      }
    }
  };

  const handleRetweet = async () => {
    if (!user) return;
    try {
      await retweetApi.create({ userId: user.id, tweetId: tweet.id });
      onRefresh();
      toast({ title: "Retweet yapıldı!" });
    } catch (err: any) {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    }
  };

  const handleComment = async () => {
    if (!user || !commentText.trim()) return;
    try {
      await commentApi.create({ content: commentText.trim(), userId: user.id, tweetId: tweet.id });
      setCommentText("");
      onRefresh();
    } catch (err: any) {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await tweetApi.delete(tweet.id);
      onRefresh();
      toast({ title: "Tweet silindi" });
    } catch (err: any) {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    try {
      await tweetApi.update(tweet.id, { content: editContent });
      setEditing(false);
      onRefresh();
    } catch (err: any) {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await commentApi.delete(commentId);
      onRefresh();
    } catch (err: any) {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="border-b border-border p-4 hover:bg-muted/50 transition-colors">
      <div className="flex gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
            {(tweet.username || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">@{tweet.username || `user${tweet.userId}`}</span>
            <span className="text-sm text-muted-foreground">
              {tweet.createdAt ? new Date(tweet.createdAt).toLocaleDateString("tr-TR") : ""}
            </span>
            {isOwner && (
              <div className="ml-auto flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(!editing)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={handleDelete}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="mt-2 space-y-2">
              <Input value={editContent} onChange={(e) => setEditContent(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpdate}>Kaydet</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>İptal</Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-foreground whitespace-pre-wrap">{tweet.content}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 mt-3">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              {tweet.commentCount ?? tweet.comments?.length ?? 0}
            </button>
            <button
              onClick={handleRetweet}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-green-500 transition-colors text-sm"
            >
              <Repeat2 className="h-4 w-4" />
              {tweet.retweetCount ?? tweet.retweets?.length ?? 0}
            </button>
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors text-sm"
            >
              <Heart className="h-4 w-4" />
              {tweet.likeCount ?? tweet.likes?.length ?? 0}
            </button>
          </div>

          {/* Comments */}
          {showComments && (
            <div className="mt-3 pl-4 border-l-2 border-border space-y-3">
              {tweet.comments?.map((c) => (
                <div key={c.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <span className="font-medium text-sm">@{c.username || `user${c.userId}`}</span>
                    <p className="text-sm text-foreground">{c.content}</p>
                  </div>
                  {(user?.id === c.userId || isOwner) && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteComment(c.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Yorum yaz..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                />
                <Button size="sm" onClick={handleComment} disabled={!commentText.trim()}>
                  Gönder
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TweetCard;
