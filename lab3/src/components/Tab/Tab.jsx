import TabButton from "./Tab.styles.js";

export default function TabNav({ children, $isActive, onClick }) {
  return (
    <TabButton $isActive={$isActive} onClick={onClick}>
      {children}
    </TabButton>
  );
}
