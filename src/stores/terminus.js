import { computed, ref } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { WOQLClient, WOQL } from '@terminusdb/terminusdb-client'
import { useViewStore } from './view'
import { ACCESS_NONE, ACCESS_READ, ACCESS_WRITE } from '@/assets/js/constants'

export const useTerminusStore = defineStore('terminus', () => {
  const viewStore = useViewStore()
  const schema = ref({})
  const nodes = ref([])
  const properties = ref([])
  const canvas = ref(null)

  const propertyClasses = ref([])
  const entityClasses = ref([])

  let client = null

  async function connect(access) {
    const user =
      localStorage.getItem('USER') || access < ACCESS_WRITE ? import.meta.env.VITE_READ_USER : null
    const key =
      localStorage.getItem('KEY') || access < ACCESS_WRITE ? import.meta.env.VITE_READ_KEY : null
    const server = import.meta.env.VITE_SERVER
    const organization = import.meta.env.VITE_ORGANIZATION
    const db = import.meta.env.VITE_DB

    if (user == null || key == null) return 'MISSING_CREDENTIALS'

    client = new WOQLClient(server, {
      user,
      [import.meta.env.VITE_AUTH_MODE]: key,
      organization,
      db
    })
    try {
      schema.value = await client.getSchemaFrame()
    } catch (error) {
      if (error.status === 401) return 'INCORRECT_CREDENTIALS'
      return 'UNEXPECTED ERROR'
    }

    return 'SUCCESS'
  }

  // const connected = computed(() => {
  //   // return Object.keys(branches.value || {}).length > 0
  // })

  const access = computed(() => {
    return Object.keys(schema.value).length === 0
      ? ACCESS_NONE
      : client.user() === import.meta.env.VITE_READ_USER
      ? ACCESS_READ
      : ACCESS_WRITE
  })

  const languages = computed(() => {
    return schema.value.Text['@metadata'].languages
    // return Object.keys(schema.value.Text).filter((key) => /^[^@]/.test(key));
  })

  // const classes = computed(() => {
  //   function getSuperClasses(inherits) {
  //     const superClasses = [inherits].flat();
  //     const superSuperClasses = superClasses
  //       .map((id) => schema.value.find((c2) => c2["@id"] === id)["@inherits"])
  //       .flat();
  //     return [...new Set([...superClasses, ...superSuperClasses])].filter(
  //       (c) => c !== undefined
  //     );
  //   }
  //   return schema.value
  //     .filter(
  //       (c) =>
  //         c["@abstract"] == null &&
  //         c["@subdocument"] == null &&
  //         c["@type"] === "Class"
  //     )
  //     .map((c) => {
  //       const superClasses = getSuperClasses(c["@inherits"])
  //         .reverse()
  //         .map((id) => schema.value.find((c2) => c2["@id"] === id));
  //       // .flat()
  //       // .map((id) => schema.value.find((c2) => c2["@id"] === id));
  //       return {
  //         ...superClasses.reduce((a, b) => ({ ...a, ...b }), {}),
  //         ...c,
  //       };
  //     });
  // });

  const edges = computed(() => {
    return properties.value
      .map((property) => {
        return {
          property,
          source: nodes.value.find((node) => node.item['@id'] === property.subject),
          target: nodes.value.find((node) => node.item['@id'] === property.object)
        }
      })
      .filter((d) => d.source != null && d.target != null)
  })

  async function addDocument(document) {
    const res = await client.addDocument(document)
    return res
  }

  async function updateDocument(document) {
    const res = await client.updateDocument(document)
    return res
  }

  async function deleteDocument(id) {
    const res = await client.deleteDocument({ id })
    return res
  }

  async function addAllocation(item, context, coordinates) {
    const node = nodes.value.find((node) => node.item['@id'] === item)
    if (node != null) {
      node.x = coordinates.x
      node.y = coordinates.y
    }
    await client.updateDocument(
      {
        '@type': 'Allocation',
        item,
        context,
        ...coordinates
      },
      { create: true },
      null,
      undefined,
      '',
      false,
      false,
      true
    )
    if (node == null) {
      getCanvas(context)
    }
    // const res = await client.getDocument({
    //   as_list: true,
    //   type: "Allocation",
    //   query: { context },
    // });
  }

  async function addProperty(subject, object) {
    const property = { subject, object, context: canvas.value }
    properties.value.push(property)

    const res = await client.updateDocument(
      {
        '@type': 'Property',
        ...property
      },
      { create: true },
      null,
      undefined,
      '',
      false,
      false,
      true
    )
    properties.value.splice(-1, 1, {
      ...property,
      '@id': res[0].replace(/^terminusdb:\/\/\/data\//, '')
    })
  }

  async function getCanvas(context, clear = false) {
    canvas.value = context
    if (clear.value) nodes.value = []
    const entities = await client.query(
      WOQL.triple('v:allocation', 'rdf:type', '@schema:Allocation')
        .triple('v:allocation', 'context', context)
        .triple('v:allocation', 'item', 'v:item_id')
        .triple('v:allocation', 'x', 'v:x')
        .triple('v:allocation', 'y', 'v:y')
        .read_document('v:item_id', 'v:item')
    )

    nodes.value = entities.bindings.map(({ item, x, y, allocation }) => ({
      '@id': allocation,
      item,
      x: x['@value'],
      y: y['@value']
    }))

    const entityIds = nodes.value.map((node) => node.item['@id'])

    const props = await client.query(
      WOQL.triple('v:property_id', 'rdf:type', '@schema:Property')
        .and(
          WOQL.once(WOQL.or(...entityIds.map((id) => WOQL.triple('v:property_id', 'subject', id)))),
          WOQL.once(WOQL.or(...entityIds.map((id) => WOQL.triple('v:property_id', 'object', id))))
        )
        .read_document('v:property_id', 'v:property')
    )

    properties.value = props.bindings.map((prop) => prop.property)

    await Promise.all([getPropertyClasses(), getEntityClasses()])
  }

  async function getPropertyClasses() {
    const res = await getDocumentsByType('PropertyClass')
    propertyClasses.value = res
  }

  async function getEntityClasses() {
    const res = await getDocumentsByType('EntityClass')
    entityClasses.value = res
  }

  async function getDocument(id) {
    return (
      await client.getDocument({
        as_list: true,
        id
      })
    )[0]
  }

  async function getDocumentsByType(type) {
    return (
      await Promise.all(
        [type].flat().map(async (t) =>
          client.getDocument({
            as_list: true,
            query: { '@type': t }
          })
        )
      )
    ).flat()
  }

  async function search(term, type) {
    const res = await client.query(
      WOQL.select('v:doc')
        .limit(16)
        .order_by(['v:dist', 'desc'])
        .triple('v:id', '@schema:label', 'v:text')
        .triple('v:id', 'rdf:type', `@schema:${type}`)
        .once(
          WOQL.or(
            ...viewStore.userLanguages.map((lang) =>
              WOQL.triple('v:text', `@schema:${lang}`, 'v:label')
            )
          )
        )
        .like(term, 'v:label', 'v:dist')
        .greater('v:dist', 0.6)
        .read_document('v:id', 'v:doc')
    )

    return res.bindings.map(({ doc }) => doc)
  }

  function pushBackNode(node) {
    nodes.value.push(nodes.value.splice(nodes.value.indexOf(node), 1)[0])
  }

  return {
    connect,
    access,
    schema,
    languages,
    nodes,
    edges,
    canvas,
    addDocument,
    updateDocument,
    deleteDocument,
    addAllocation,
    addProperty,
    getCanvas,
    getDocument,
    getDocumentsByType,
    search,
    pushBackNode,
    getPropertyClasses,
    getEntityClasses,
    propertyClasses,
    entityClasses
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTerminusStore, import.meta.hot))
}
