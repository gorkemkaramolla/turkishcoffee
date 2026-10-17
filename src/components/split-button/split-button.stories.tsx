import type { Meta, StoryObj } from "@storybook/react-vite";
import {
    SplitButton,
    SplitButtonAction,
    SplitButtonMenu,
} from "./split-button";
import { DropdownMenuItem } from "../dropdown-menu/dropdown-menu";

const meta = {
    title: "Components/SplitButton",
    component: SplitButton,
} satisfies Meta<typeof SplitButton>;
export default meta;
type Story = StoryObj<typeof meta>;

const items = (
    <>
        <DropdownMenuItem>Save as draft</DropdownMenuItem>
        <DropdownMenuItem>Save and close</DropdownMenuItem>
    </>
);

/** The left half saves; the chevron opens related actions. */
export const Variants: Story = {
    render: () => (
        <div className="flex flex-col items-start gap-4">
            {(["primary", "secondary"] as const).map((variant) => (
                <SplitButton key={variant} variant={variant}>
                    <SplitButtonAction>LONG BUTTON TEXT</SplitButtonAction>
                    <SplitButtonMenu label="More save options">
                        {items}
                    </SplitButtonMenu>
                </SplitButton>
            ))}
        </div>
    ),
};

/** The action disabled alone: the menu still works. */
export const ActionDisabled: Story = {
    render: () => (
        <SplitButton>
            <SplitButtonAction disabled>Save</SplitButtonAction>
            <SplitButtonMenu label="More save options">{items}</SplitButtonMenu>
        </SplitButton>
    ),
};

export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-4">
            {(["sm", "md", "lg"] as const).map((size) => (
                <SplitButton key={size} size={size} variant="secondary">
                    <SplitButtonAction>Save</SplitButtonAction>
                    <SplitButtonMenu label="More save options">
                        {items}
                    </SplitButtonMenu>
                </SplitButton>
            ))}
        </div>
    ),
};
