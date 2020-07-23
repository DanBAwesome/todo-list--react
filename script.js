const userId = 173;
const checkStatus = (response) => {
    if (response.ok) {
        return response;
    }

    throw new Error('Request Was Either 404 or 500');
}

const json = (response) => response.json();

class Task extends React.Component {
    render() {
        const { task, onDelete, onComplete } = this.props;
        const { id, content, completed } = task;

        return (
            <div className="task">
                <div onClick={() => onComplete(id, completed)} className={completed ? 'complete' : 'active'}>
                    <span>{content}</span>
                </div>
                <button className="remove" onClick={() => onDelete(id)}>
                    <div></div>
                </button>
            </div>
        )
    }
}

class TodoList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            new_task: '',
            tasks: [],
            loading: true,
            error: '',
            filter: 'all'
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggleComplete = this.toggleComplete.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.fetchTasks = this.fetchTasks.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
    }

    componentDidMount() {
        this.fetchTasks();
    }

    fetchTasks() {
        fetch(`https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=${userId}`)
            .then(checkStatus)
            .then(json)
            .then((data) => {
                console.log(data);
                this.setState({
                    tasks: data.tasks,
                    loading: false,
                });
            }).catch((error) => {
                console.log(error);
            })
    }

    handleChange(event) {
        this.setState({
            new_task: event.target.value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        let { new_task } = this.state;
        new_task = new_task.trim();
        if (!new_task) {
            return;
        }

        fetch(`https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=${userId}`, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                task: {
                    content: new_task
                }
            })
        })
            .then(checkStatus)
            .then(json)
            .then(() => {
                this.setState({ new_task: '' });
                this.fetchTasks();
            })
            .catch((error) => {
                this.setState({ error: error.message });
                console.log(error);
            })
    }

    toggleComplete(id, completed) {
        if (!id) {
            return;
        }

        const new_state = completed ? 'active' : 'complete';

        fetch(`https://altcademy-to-do-list-api.herokuapp.com/tasks/${id}/mark_${new_state}?api_key=${userId}`, {
            method: "PUT",
            mode: "cors"
        })
            .then(checkStatus)
            .then(json)
            .then(() => {
                this.fetchTasks();
            })
            .catch((error) => {
                this.setState({ error: error.message });
                console.log(error);
            })
    }

    toggleFilter(event) {
        this.setState({ filter: event.target.name });
    }

    deleteTask(id) {
        if (!id) {
            return;
        }

        fetch(`https://altcademy-to-do-list-api.herokuapp.com/tasks/${id}?api_key=${userId}`, {
            method: "DELETE",
            mode: "cors"
        })
            .then(checkStatus)
            .then(json)
            .then(() => {
                this.fetchTasks();
            })
            .catch((error) => {
                this.setState({ error: error.message });
                console.log(error);
            })
    }

    render() {
        const { new_task, tasks, loading, filter } = this.state;

        return (
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="card mt-4">
                            <h2 className="card-title text-center mt-2">Todo List</h2>
                            <div className="tasks">
                                {tasks.length > 0 ? tasks.filter((task) => {
                                    switch (filter) {
                                        case 'active':
                                            return !task.completed;
                                        case 'completed':
                                            return task.completed;
                                        default:
                                            return true;
                                    }
                                }).map((task) => {
                                    return <Task key={task.id} task={task}
                                        onDelete={this.deleteTask} onComplete={this.toggleComplete} />
                                }) : loading ? <p><i className="fa fa-spin fa-spinner mr-2"></i>Loading</p> : <p>No Tasks Here</p>
                                }
                            </div>
                            <div className="status-filter">
                                <label>
                                    <input type="checkbox" name="all"
                                        checked={filter === 'all'}
                                        onChange={this.toggleFilter} /> All
                            </label>
                                <label>
                                    <input type="checkbox" name="active"
                                        checked={filter === 'active'}
                                        onChange={this.toggleFilter} /> Active
                            </label>
                                <label>
                                    <input type="checkbox" name="completed"
                                        checked={filter === 'completed'}
                                        onChange={this.toggleFilter} /> Completed
                            </label>
                            </div>
                            <form onSubmit={this.handleSubmit} className="form-inline my-4">
                                <input
                                    type="text"
                                    className="form-control mr-sm-2 mb-2"
                                    placeholder="New Task"
                                    value={new_task}
                                    onChange={this.handleChange} />
                                <button type="submit" className="btn btn-primary mb-2">Create Task</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

ReactDOM.render(
    <TodoList />,
    document.getElementById('root')
)