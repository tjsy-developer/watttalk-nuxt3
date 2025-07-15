<template>
    <div>
        <ul class="org-tree">
            <TreeNode
                v-for="(node, index) in filteredData"
                :key="index"
                :node="node"
                :openNodes="openNodes"
                :parentPath="[]"
            />
        </ul>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import TreeNode from "@/components/pages/dashboard/TreeNode.vue";

interface OrgNode {
	name: string;
	status: number;
	deviteType: number;
    children?: OrgNode[];
}

const props = defineProps<{
    data: OrgNode[];
    search: string;
}>();

const openNodes = ref(new Set<string>());

watch(() => props.search as any, (newName) => {
    openNodes.value.clear();

    if (!newName) return;

    function getNodeKey(path: string[]) {
        return path.join(">");
    }

    function searchAndOpen(nodes: OrgNode[], path: string[] = []) {
        for (const node of nodes) {
            const currentPath = [...path, node.name];
            const isLeaf = !node.children || node.children.length === 0;
            if (isLeaf && node.name.includes(newName)) {
                for (let i = 1; i <= currentPath.length; i++) {
                    openNodes.value.add(getNodeKey(currentPath.slice(0, i)));
                }
            }

            if (node.children) {
                searchAndOpen(node.children, currentPath);
            }
        }
    }

    searchAndOpen(props.data);
});

const filteredData = computed(() => {
    if (!props.search) return props.data;

    function filterNodes(nodes: OrgNode[]): OrgNode[] {
        const result: OrgNode[] = [];

        for (const node of nodes) {
            const matched =
                node.name.includes(props.search) ||
                (node.children && filterNodes(node.children).length > 0);

            if (matched) {
                result.push({
                    ...node,
                    children: node.children ? filterNodes(node.children) : [],
                });
            }
        }

        return result;
    }

    return filterNodes(props.data);
});
</script>

<style scoped>
.org-tree {
    list-style: none;
    padding: 0;
    margin: 0;
}
</style>
