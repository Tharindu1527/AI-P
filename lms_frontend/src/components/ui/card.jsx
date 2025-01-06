import * as React from "react";
import { cn } from "../../lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border-0 bg-white/80 backdrop-blur-sm shadow-lg",
      "transition-all duration-300 hover:shadow-xl",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      "border-b border-purple-100",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-none tracking-tight",
      "bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-gray-500",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "p-6 pt-0",
      className
    )}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Specialized card variants
const FileCard = React.forwardRef(({ className, children, onDelete, fileName, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "flex items-center justify-between p-4",
      "bg-white rounded-lg border border-purple-100",
      "shadow-sm hover:shadow-md transition-shadow duration-300",
      className
    )}
    {...props}
  >
    {children}
  </Card>
));
FileCard.displayName = "FileCard";

const ResultCard = React.forwardRef(({ className, children, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "p-4 bg-white rounded-lg",
      "border border-purple-100 shadow-sm",
      className
    )}
    {...props}
  >
    {children}
  </Card>
));
ResultCard.displayName = "ResultCard";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  FileCard,
  ResultCard
};