//DOM取得

const addBtn = document.getElementById("add-btn")
const input = document.getElementById("todo-input")
const list = document.getElementById("todo-list")
const count = document.getElementById("todo-count")
const deadlineInput = document.getElementById("deadline-input")
const categoryInput = document.getElementById("category-input")
const filterButtons = document.getElementById("filter-buttons")

//保存

const savedTodos = localStorage.getItem("todos")
let state = {
    todos: savedTodos ? JSON.parse(savedTodos) : [],
    filterCategory: "all"
}

//初期設定

function setState(updater) {
    state = updater(state)
    localStorage.setItem("todos", JSON.stringify(state.todos))
    render()
}

// 期限情報の取得
function getDeadlineInfo(deadline) {
    if(!deadline) {
        return {
            text: "期限: なし",
            color: ""
        }
    }

    const today = new Date()
    const deadlineDate = new Date(deadline)

    today.setHours(0, 0, 0, 0)
    deadlineDate.setHours(0, 0, 0, 0)

    const diff = deadlineDate - today
    const oneDay = 24 * 60 * 60 * 1000
    const diffDays = diff / oneDay

    if(diffDays === 1) {
        return {
            text: `期限: ${deadline}（明日）`,
            color: "orange"
        }
    } else if(diffDays === 0) {
        return {
            text: `⚠期限が今日までです: ${deadline}`,
            color: "red"
        }
    } else if(diffDays < 0) {
        return {
            text: `✖期限切れ: ${deadline}（${Math.abs(diffDays)}日経過）`,
            color: "red"
        }
    } else {
        return {
            text: `期限: ${deadline}（あと${diffDays}日）`,
            color: ""
        }
    }

}

//フィルター関数

function getFilteredTodos(todos, category) {
    if(category === "all") return todos

    return todos.filter(todo => todo.category === category)
}

//ソート関数

function getSortedTodos(todos) {

    const activeTodos = todos.filter(todo => !todo.done)

    const withDeadline = activeTodos
        .filter(todo => todo.deadline)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))

    const noDeadline = activeTodos
        .filter(todo => !todo.deadline)
        .sort((a, b) => b.id - a.id)

    const completed = todos
        .filter(todo => todo.done)
        .sort((a, b) => b.id - a.id)

    return [
        ...withDeadline,
        ...noDeadline,
        ...completed
    ]
}

//投影イベント

function render() {
    list.innerHTML = ""

    const filteredTodos = getFilteredTodos(
        state.todos,
        state.filterCategory
    )

    const sortedTodos = getSortedTodos(filteredTodos)

    const activeTodos = filteredTodos.filter(todo => !todo.done)
    const completedTodos = filteredTodos.filter(todo => todo.done)
    
    count.textContent = 
        `未完了: ${activeTodos.length} 完了: ${completedTodos.length}`

    const filterBtnList = filterButtons.querySelectorAll("button")

        filterBtnList.forEach(button => {
            if(button.dataset.filter === state.filterCategory) {
                button.classList.add("active")
            } else {
                button.classList.remove("active")
            }
        })

    sortedTodos.forEach(todo => {
        const li = document.createElement("li")
        const deadlineInfo = getDeadlineInfo(todo.deadline)

        if(todo.done) {
            li.style.background = "rgba(1, 8, 14, 0.55)"
            li.style.borderColor = "rgba(126, 211, 255, 0.04)"
            li.style.boxShadow = "0 6px 18px rgba(0, 0, 0, 0.12)"
        }
        if(!todo.done && deadlineInfo.color === "red") {
            li.style.borderColor = "rgba(255, 140, 100, 0.45)"
            li.style.boxShadow = "0 10px 24px rgba(255, 120, 80, 0.10)"
        }

        const checkBtn = document.createElement("button")
        checkBtn.textContent = todo.done ? "☑" : "☐"
        checkBtn.dataset.id = todo.id
        checkBtn.dataset.type = "toggle"

        if(todo.done) {
            checkBtn.style.opacity = "0.55"
        }

        const span = document.createElement("span")
        span.textContent = todo.text 
        if(todo.done) {
            span.style.textDecoration = "line-through"
            span.style.color = "rgba(232, 246, 255, 0.45)"
        }

        const categorySpan = document.createElement("span")
        categorySpan.textContent = `[${todo.category}]`
        categorySpan.classList.add(`category-${todo.category}`)

        if(todo.done) {
            categorySpan.style.opacity = "0.45"
        }

        const deadlineText = document.createElement("span")
        

        deadlineText.textContent = deadlineInfo.text 
        deadlineText.style.color = deadlineInfo.color
        deadlineText.style.fontWeight = "700"

        if(todo.done) {
            deadlineText.style.opacity = "0.45"
        }

        const memoSpan = document.createElement("div")

        if(todo.memo) {
            memoSpan.textContent = `メモ: ${todo.memo}`

            if(todo.done) {
                memoSpan.style.opacity = "0.5"
                memoSpan.style.background = "rgba(255, 255, 255, 0.4)"
                memoSpan.style.borderLeftColor = "rgba(115, 210, 255, 0.25)"
            }

            li.appendChild(memoSpan)
        }

        const memoBtn = document.createElement("button")
        memoBtn.textContent = "メモ"
        memoBtn.dataset.id = todo.id
        memoBtn.dataset.type = "memo"

        if(todo.done) {
            memoBtn.style.opacity = "0.5"
        }

        const editBtn = document.createElement("button")
        editBtn.textContent = "編集"
        editBtn.dataset.id = todo.id
        editBtn.dataset.type = "edit"

        if(todo.done) {
            editBtn.style.opacity = "0.5"
        }

        const deleteBtn = document.createElement("button")
        deleteBtn.textContent = "削除"
        deleteBtn.dataset.id = todo.id
        deleteBtn.dataset.type = "delete"

        if(todo.done) {
            deleteBtn.style.opacity = "0.5"
        }

        

        li.appendChild(checkBtn)
        li.appendChild(span)   
        li.appendChild(categorySpan)
        li.appendChild(deadlineText)

        li.appendChild(memoBtn)
        li.appendChild(editBtn)
        li.appendChild(deleteBtn)

        list.appendChild(li)

    })
}

//todo追加処理

function addTodo() {
    const text = input.value.trim()
    const category = categoryInput.value
    const deadline = deadlineInput.value

    if(!text) return

    if(!category) {
        alert("カテゴリを選択してください")
        return
    }

    setState(prev => {
        return {
            ...prev,
            todos: [...prev.todos, {
                id: Date.now(),
                text,
                category,
                deadline,
                memo: "",
                done: false
            }]
        }
    })

    input.value = ""
    categoryInput.value = ""
    deadlineInput.value = ""
    input.focus()

}

addBtn.addEventListener("click", addTodo)

//inputでEnterを拾う
input.addEventListener("keydown", (e) => {
    if(e.key === "Enter") {
        addTodo()
    }
})

//カテゴリフィルターボタン

filterButtons.addEventListener("click", (e) => {
    const filter = e.target.dataset.filter

    if(!filter) return

    setState(prev => {
        return {
            ...prev,
            filterCategory: filter
        }
    })
})

//削除・完了切り替えボタン

list.addEventListener("click", (e) => {
    if(!e.target.dataset.id) return

    const id = Number(e.target.dataset.id)
    const type = e.target.dataset.type

    if(type === "delete") {
        setState(prev => {
            return {
                ...prev,
                todos: prev.todos.filter(todo => todo.id !== id)
            }
        })
    }

    if(type === "edit") {
        const targetTodo = state.todos.find(todo => todo.id === id)

        if(!targetTodo) return

        const newText = prompt("新しいタスク内容", targetTodo.text)
        if(newText === null) return

        const trimmedText = newText.trim()
        if(!trimmedText) return

        setState(prev => {
            return {
                ...prev,
                todos: prev.todos.map(todo => {
                    if(todo.id === id) {
                        return {
                            ...todo,
                            text: trimmedText
                        }
                    }
                    return todo
                })
            }
        })
    }

    if(type === "toggle") {
        setState(prev => {
            return {
                ...prev,
                todos: prev.todos.map(todo => {
                    if(todo.id === id) {
                        return {
                            ...todo,
                            done: !todo.done
                        }
                    }
                    return todo
                })
            }
        })
    }

    if(type === "memo") {

        const targetTodo = state.todos.find(todo => todo.id === id)
        if(!targetTodo) return

        const newMemo = prompt("メモを入力", targetTodo.memo || "")
        if(newMemo === null) return

        setState(prev => {
            return {
                ...prev,
                todos: prev.todos.map(todo => {
                    if(todo.id === id) {
                        return {
                            ...todo,
                            memo: newMemo
                        }
                    }
                    return todo
                })
            }
        })
    }

})
render()