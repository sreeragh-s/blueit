
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ThreadHeader = () => {
  return (
    <Button variant="ghost" className="mb-4" asChild>
      <Link to="/">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to feed
      </Link>
    </Button>
  );
};

export default ThreadHeader;
