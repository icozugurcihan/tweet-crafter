import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Twitter, Home, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full p-4 border-r border-border">
      <Twitter className="h-8 w-8 text-primary mb-8" />
      
      <nav className="space-y-2 flex-1">
        <Button variant="ghost" className="w-full justify-start gap-3 text-base" onClick={() => navigate("/")}>
          <Home className="h-5 w-5" /> Ana Sayfa
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-base" onClick={() => navigate("/profile")}>
          <User className="h-5 w-5" /> Profil
        </Button>
      </nav>

      {user && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-foreground">@{user.username}</span>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-5 w-5" /> Çıkış Yap
          </Button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
