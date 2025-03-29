
import { Loader2 } from "lucide-react";

const ThreadLoadingState = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default ThreadLoadingState;
