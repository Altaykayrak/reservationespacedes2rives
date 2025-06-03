
import { useState } from "react";
import { useChildrenData } from "./useChildrenData";

export const useChildSelection = () => {
  const [selectedChild, setSelectedChild] = useState("");
  const { children, wednesdayEligibleChildren } = useChildrenData();

  return {
    selectedChild,
    setSelectedChild,
    children,
    wednesdayEligibleChildren
  };
};
