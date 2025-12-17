import React from "react";

const ArchiveTitle = ({
  title,
  subtitle,
}: {
  title: string | React.ReactNode;
  subtitle: string | React.ReactNode;
}) => {
  return (
    <div className="space-y-4 flex-1">
      <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold text-balance">
        {title}
      </h1>
      <p className="text-base sm:text-lg xl:text-xl text-muted-foreground text-pretty">
        {subtitle}
      </p>
    </div>
  );
};

export default ArchiveTitle;
