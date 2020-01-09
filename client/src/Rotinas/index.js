import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'

import { getData, atualizaRotina, deletaRotina, deletaVersao } from './api'
import { MessageSnackBar, MaterialTable } from '../helpers'

export default withRouter(props => {
  const [rotinas, setRotinas] = useState([])
  const [versoes, setVersoes] = useState([])
  const [categorias, setCategorias] = useState({})

  const [snackbar, setSnackbar] = useState('')
  const [refresh, setRefresh] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let isCurrent = true
    const load = async () => {
      try {
        const response = await getData()
        if (!response || !isCurrent) return
        setRotinas(response.rotinas)
        setVersoes(response.versoes)

        const lookup = response.categorias.reduce((map, obj) => {
          map[obj.id] = obj.nome
          return map
        }, {})

        setCategorias(lookup)
        setLoaded(true)
      } catch (err) {
        setSnackbar({ status: 'error', msg: 'Ocorreu um erro ao se comunicar com o servidor.', date: new Date() })
      }
    }
    load()

    return () => {
      isCurrent = false
    }
  }, [refresh])

  const handleUpdateRotina = async (newData, oldData) => {
    try {
      const response = await atualizaRotina(newData.id, newData.rotina, newData.descricao, newData.categoria_id, newData.ativa)
      if (!response) return

      setRefresh(new Date())
      setSnackbar({ status: 'success', msg: 'Rotina atualizada com sucesso', date: new Date() })
    } catch (err) {
      if (
        'response' in err &&
        'data' in err.response &&
        'message' in err.response.data
      ) {
        setSnackbar({ status: 'error', msg: err.response.data.message, date: new Date() })
      } else {
        setSnackbar({ status: 'error', msg: 'Ocorreu um erro ao se comunicar com o servidor.', date: new Date() })
      }
    }
  }

  const handleDeleteRotina = async oldData => {
    try {
      const response = await deletaRotina(oldData.id)
      if (!response) return

      setRefresh(new Date())
      setSnackbar({ status: 'success', msg: 'Rotina deletada com sucesso', date: new Date() })
    } catch (err) {
      setSnackbar({ status: 'error', msg: 'Ocorreu um erro ao se comunicar com o servidor.', date: new Date() })
    }
  }

  const handleDeleteVersao = async oldData => {
    try {
      const response = await deletaVersao(oldData.id)
      if (!response) return

      setRefresh(new Date())
      setSnackbar({ status: 'success', msg: 'Versao deletada com sucesso', date: new Date() })
    } catch (err) {
      setSnackbar({ status: 'error', msg: 'Ocorreu um erro ao se comunicar com o servidor.', date: new Date() })
    }
  }

  return (
    <>
      <MaterialTable
        title='Rotinas'
        loaded={loaded}
        columns={[
          { title: 'id', field: 'id', editable: 'never' },
          { title: 'Nome', field: 'rotina' },
          { title: 'Categoria', field: 'categoria_id', lookup: categorias },
          { title: 'Versão', field: 'versao', editable: 'never' },
          { title: 'Data', field: 'data', editable: 'never' },
          { title: 'Ativa', field: 'ativa', type: 'boolean' },
          { title: 'Download', field: 'path', editable: 'never', render: rowData => (<a href={rowData.path} download>Download</a>) }
        ]}
        data={rotinas}
        editable={{
          onRowUpdate: handleUpdateRotina,
          onRowDelete: handleDeleteRotina
        }}
        detailPanel={rowData => {
          return (
            <div style={{ margin: '15px' }}>
              <p><b>Descriçãp:</b> {rowData.descricao}</p>
            </div>
          )
        }}
      />
      <MaterialTable
        title='Versões'
        loaded={loaded}
        columns={[
          { title: 'Nome', field: 'rotina' },
          { title: 'Categoria', field: 'categoria' },
          { title: 'Versão', field: 'versao' },
          { title: 'Data', field: 'data' },
          { title: 'Versão atual', field: 'atual', type: 'boolean' },
          { title: 'Download', field: 'path', editable: 'never', render: rowData => (<a href={rowData.path} download>Download</a>) }
        ]}
        data={versoes}
        editable={{
          onRowDelete: handleDeleteVersao
        }}
        detailPanel={rowData => {
          return (
            <div style={{ margin: '15px' }}>
              <p><b>Autor:</b> {rowData.usuario}</p>
              <p><b>Parâmetros:</b> {rowData.parametros.join(', ')}</p>
            </div>
          )
        }}
        options={{
          rowStyle: rowData => ({
            backgroundColor: rowData.atual ? '#d4ffde' : '#FFF'
          })
        }}
      />
      {snackbar ? <MessageSnackBar status={snackbar.status} key={snackbar.date} msg={snackbar.msg} /> : null}
    </>
  )
})
