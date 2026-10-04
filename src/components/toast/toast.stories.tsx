import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toaster, toast } from "./index";
import { Button } from "../button/button";

const meta = { title: "Components/Toast", component: Toaster } satisfies Meta<
    typeof Toaster
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { richColors: true },
    render: (args) => (
        <div className="flex flex-wrap gap-3">
            <Button
                onClick={() =>
                    toast("Scheduled", { description: "Friday at 10:00." })
                }
            >
                Default
            </Button>
            <Button variant="success" onClick={() => toast.success("Saved")}>
                Success
            </Button>
            <Button
                variant="destructive"
                onClick={() =>
                    toast.error("Failed", {
                        description: "Could not reach the server.",
                    })
                }
            >
                Error
            </Button>
            <Button
                variant="secondary"
                onClick={() => toast.info("Leave requests close on Friday")}
            >
                Info
            </Button>
            <Button
                variant="secondary"
                onClick={() => toast.warning("Trial ends soon")}
            >
                Warning
            </Button>
            <Button
                variant="outline"
                onClick={() =>
                    toast("Message archived", {
                        action: { label: "Undo", onClick: () => {} },
                    })
                }
            >
                With action
            </Button>
            {/* Mount <Toaster /> once near your app root. */}
            <Toaster {...args} />
        </div>
    ),
};

/** Without `richColors` the toast stays neutral and the icon carries the type's colour. */
export const Plain: Story = { ...Default, args: { richColors: false } };
