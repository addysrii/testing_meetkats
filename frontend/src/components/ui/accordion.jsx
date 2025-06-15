import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as React from "react";

import { cn } from "../../lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef(null);

  const combinedRef = (node) => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
    triggerRef.current = node;
  };

  React.useEffect(() => {
    const handleStateChange = () => {
      if (triggerRef.current) {
        setIsOpen(triggerRef.current.getAttribute('data-state') === 'open');
      }
    };

    if (triggerRef.current) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === 'attributes' &&
            mutation.attributeName === 'data-state'
          ) {
            handleStateChange();
          }
        });
      });

      observer.observe(triggerRef.current, { attributes: true });

      handleStateChange();

      return () => observer.disconnect();
    }
  }, []);

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={combinedRef}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left",
          className,
        )}
        onClick={() => {
          // No-op, handled by mutation observer
        }}
        {...props}
      >
        {children}
        <div className="flex-shrink-0 relative w-6 h-6 flex items-center justify-center">
          {isOpen ? (
            <img
              src="/faq-icons-1.svg"
              alt="Collapse"
              width={24}
              height={24}
              className="transition-opacity duration-200"
            />
          ) : (
            <img
              src="/faq-icons.svg"
              alt="Expand"
              width={24}
              height={24}
              className="transition-opacity duration-200"
            />
          )}
        </div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
