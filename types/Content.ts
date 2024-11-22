export interface ContentItem {
    id: number;
    title: string;
    summary: string;
    link: string;
    date: string;
    type: "youtube" | "article" | "podcast";
    passed: Boolean;
    shown: Boolean;
}
