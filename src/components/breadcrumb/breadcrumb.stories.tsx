import type { Meta, StoryObj } from "@storybook/react-vite";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
    BreadcrumbButton,
} from "./breadcrumb";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../dropdown-menu/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/tooltip";
import { FolderUserIcon, UserIcon, UsersIcon } from "../../lib/icons";

const meta = {
    title: "Components/Breadcrumb",
    component: Breadcrumb,
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover a link: the step gets the selection fill and its text brightens. */
export const Default: Story = {
    render: () => (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Billing</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    ),
};

/** An icon goes before the text as a child; it turns primary on hover. */
export const WithIcons: Story = {
    render: () => (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="#">
                        <UsersIcon />
                        Employees
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="#">
                        <FolderUserIcon />
                        Personnel files
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        <UserIcon />
                        Mona Kane
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    ),
};

/** Text past about 30 characters truncates; hover it for the full name. */
export const LongNames: Story = {
    render: () => (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="#">
                        <FolderUserIcon />
                        Quarterly performance reviews for engineering
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        Mona Kane — senior platform engineer, Istanbul office
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    ),
};

const hidden = ["Settings", "Organisation", "Departments"];

/**
 * A long trail keeps its first and last steps; the middle collapses into a
 * menu. The tooltip gives a count, not the hidden names.
 */
export const Collapsed: Story = {
    render: () => (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <Tooltip>
                        <DropdownMenu>
                            <TooltipTrigger
                                render={
                                    <DropdownMenuTrigger
                                        render={
                                            <BreadcrumbButton
                                                aria-label={`Show ${hidden.length} more`}
                                            />
                                        }
                                    />
                                }
                            >
                                <BreadcrumbEllipsis />
                            </TooltipTrigger>
                            <DropdownMenuContent align="start">
                                {hidden.map((name) => (
                                    <DropdownMenuItem
                                        key={name}
                                        render={<a href="#" />}
                                    >
                                        {name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <TooltipContent>{hidden.length} items</TooltipContent>
                    </Tooltip>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="#">HR</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Leave policy</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    ),
};
