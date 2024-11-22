import { ContentItem } from '@/types/Content';

function update(contentItem: ContentItem, passed: Boolean) {
    contentItem.shown = true;
    contentItem.passed = passed;
    return contentItem;
}
