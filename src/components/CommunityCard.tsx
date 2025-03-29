
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CommunityWithMemberCount } from "@/hooks/use-communities";

interface CommunityCardProps {
  community: CommunityWithMemberCount;
}

const CommunityCard = ({ community }: CommunityCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="h-32 w-full bg-cover bg-center"
        style={
          community.banner_image 
            ? { backgroundImage: `url(${community.banner_image})` } 
            : { backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 70%), hsl(var(--secondary) / 70%))` }
        }
      />
      
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-start">
          <Link 
            to={`/community/${community.id}`}
            className="hover:text-primary transition-colors"
          >
            c/{community.name}
          </Link>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users size={14} className="mr-1" />
            {community.memberCount.toLocaleString()}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {community.description ? (
            community.description.length > 120
              ? community.description.substring(0, 120) + "..."
              : community.description
          ) : "No description available."}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {community.tags && community.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button asChild className="w-full">
          <Link to={`/community/${community.id}`}>
            View Community
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CommunityCard;
