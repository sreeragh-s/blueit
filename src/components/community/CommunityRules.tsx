
import React from "react";

interface CommunityRulesProps {
  rules: string[] | null;
}

const CommunityRules = ({ rules }: CommunityRulesProps) => {
  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Channel Rules</h2>
      {rules && rules.length > 0 ? (
        <ol className="list-decimal pl-5 space-y-3">
          {rules.map((rule, index) => (
            <li key={index} className="text-foreground/90">
              {rule}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-muted-foreground">
          No rules have been set for this community yet.
        </p>
      )}
    </div>
  );
};

export default CommunityRules;
