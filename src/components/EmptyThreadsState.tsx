
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const EmptyThreadsState = () => {
  return (
    <div className="text-center py-10">
      <p className="text-muted-foreground">No threads found. Be the first to create one!</p>
      <Button asChild className="mt-4">
        <Link to="/create">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Thread
        </Link>
      </Button>
    </div>
  );
};

export default EmptyThreadsState;
