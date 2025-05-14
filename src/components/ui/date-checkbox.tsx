
import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface DateCheckboxProps extends React.ComponentPropsWithoutRef<typeof Checkbox> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export const DateCheckbox = React.forwardRef<
  React.ElementRef<typeof Checkbox>,
  DateCheckboxProps
>(({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
  return (
    <Checkbox 
      ref={ref}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={className}
      {...props}
    />
  );
});

DateCheckbox.displayName = "DateCheckbox";
