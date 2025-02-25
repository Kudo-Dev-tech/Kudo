import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-4 mt-auto">
      <div className="container flex justify-between items-center">
        <div className="text-sm text-muted-foreground font">
          © {currentYear} KUDO - The Agentic Covenant Framework. All rights
          reserved.
        </div>
        <div className="flex items-center space-x-4">{/* social links */}</div>
      </div>
    </footer>
  );
};

export default Footer;
