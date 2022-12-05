import React from "react";
export interface TransactionResponsesProps {
  transactionHashes: string[];
}
export function TransactionResponses({
  transactionHashes,
}: TransactionResponsesProps) {
  if (transactionHashes?.length) {
    return (
      <div>
        {transactionHashes.map((response, index) => (
          <div key={index}>
            <a href={"https://goerli.etherscan.io/tx/" + response}>
              {"https://goerli.etherscan.io/tx/" + response}
            </a>
          </div>
        ))}
      </div>
    );
  }
  return null;
}
