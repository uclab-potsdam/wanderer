import { terminusStore, document, emit } from './ModalEdit.vue';

export async function updateDocument() {
const id = await terminusStore.updateDocument([document.value]);
terminusStore.refreshDocument(id);
emit('close');
// emit('update')
}
