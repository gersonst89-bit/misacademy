import { useState } from "react";
import type { ReactNode } from "react";
import { MdExpandMore, MdExpandLess, MdFolderOpen } from "react-icons/md";

interface AccordionProps {
  title: string;
  children: ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left flex items-center justify-between gap-2 px-2 py-2 rounded hover:bg-gray-700"
      >
        <div className="flex items-center gap-2">
          <MdFolderOpen size={20} />
          <span>{title}</span>
        </div>

        <div>
          {isOpen ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
        </div>
      </button>

      {isOpen && <div className="pl-4 py-2">{children}</div>}
    </div>
  );
};

export default Accordion;
