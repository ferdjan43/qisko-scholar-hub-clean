import { useState, useEffect } from "react";
import { Heart, MessageCircle, Trash2, Edit2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  content: string;
  images: any;
  links: any;
  is_pinned: boolean;
  created_at: string;
  institution_id: string;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface Props {
  post: Post;
  institutionName: string;
  institutionPhoto: string | null;
  canEdit: boolean;
  onDelete?: (postId: string) => void;
  onEdit?: (postId: string) => void;
}

export default function PostCard({ post, institutionName, institutionPhoto, canEdit, onDelete, onEdit }: Props) {
  const { toast } = useToast();
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("");

  useEffect(() => {
    loadCurrentUser();
    loadLikes();
    loadComments();
  }, [post.id]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile) setCurrentUserName(profile.full_name || "User");
    }
  };

  const loadLikes = async () => {
    const { count } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post.id);
    
    setLikesCount(count || 0);

    if (currentUserId) {
      const { data } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", post.id)
        .eq("user_id", currentUserId)
        .maybeSingle();
      
      setIsLiked(!!data);
    }
  };

  const loadComments = async () => {
    const { data, count } = await supabase
      .from("post_comments")
      .select(`
        id,
        content,
        user_id,
        created_at,
        profiles!post_comments_user_id_fkey (
          full_name
        )
      `, { count: "exact" })
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    
    setCommentsCount(count || 0);
    if (data) setComments(data as any);
  };

  const toggleLike = async () => {
    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }

    if (isLiked) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUserId);

      if (!error) {
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      }
    } else {
      const { error } = await supabase
        .from("post_likes")
        .insert({
          post_id: post.id,
          user_id: currentUserId,
        });

      if (!error) {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    }
  };

  const submitComment = async () => {
    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    const { error } = await supabase
      .from("post_comments")
      .insert({
        post_id: post.id,
        user_id: currentUserId,
        content: newComment.trim(),
      });

    if (!error) {
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added",
      });
      // Reload comments immediately
      await loadComments();
    } else {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", currentUserId!);

    if (!error) {
      loadComments();
      toast({
        title: "Success",
        description: "Comment deleted",
      });
    }
  };

  const images = Array.isArray(post.images) ? post.images : [];
  const links = Array.isArray(post.links) ? post.links : [];

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {institutionPhoto ? (
                <img src={institutionPhoto} alt={institutionName} className="w-full h-full object-contain" />
              ) : (
                <AvatarFallback className="bg-primary text-white">
                  {institutionName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{institutionName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {canEdit && (
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={() => onEdit(post.id)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="icon" onClick={() => onDelete(post.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Post Content */}
        <p className="text-foreground mb-4 whitespace-pre-wrap">{post.content}</p>

        {/* Post Images */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {images.map((img: string, idx: number) => (
              <img
                key={idx}
                src={img}
                alt={`Post image ${idx + 1}`}
                className="rounded-lg w-full h-48 object-cover"
              />
            ))}
          </div>
        )}

        {/* Post Links */}
        {links.length > 0 && (
          <div className="space-y-2 mb-4">
            {links.map((link: any, idx: number) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <p className="font-medium text-sm text-primary">{link.title || "Link"}</p>
                <p className="text-xs text-muted-foreground truncate">{link.url}</p>
              </a>
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center gap-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLike}
            className={`gap-2 ${isLiked ? "text-red-500" : ""}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{likesCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{commentsCount}</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* Comment Input */}
            {currentUserId && (
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white text-xs">
                    {currentUserName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <Button size="icon" onClick={submitComment}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white text-xs">
                    {comment.profiles?.full_name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="font-semibold text-sm text-foreground">
                      {comment.profiles?.full_name || "Unknown User"}
                    </p>
                    <p className="text-sm text-foreground mt-1">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 px-3">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                    {comment.user_id === currentUserId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
