import React, { Component, Fragment } from 'react';
import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import AuthContext from '../context/auth-context';
import Spinner from '../components/spinner/spinner';

import './Events.css';

class EventsPage extends Component {
    state = {
        creating: false,
        events: [],
        isLoading: false,
        selectedEvent: null
    };

    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.titleElRef = React.createRef();
        this.priceElRef = React.createRef();
        this.dateElRef = React.createRef();
        this.descriptionElRef = React.createRef();
    }

    componentDidMount() {
        this.fetchEvents();
    }

    startCreateEventHandler = () => {
        this.setState({creating: true});
    }

    modalConfirmHandler = () => {
        this.setState({creating: false});
        const title = this.titleElRef.current.value;
        const price = +this.priceElRef.current.value;
        const date = this.dateElRef.current.value;
        const description = this.descriptionElRef.current.value;

        if (title.trim().length === 0 || price <= 0 || date.trim().length === 0 || description.trim().length === 0) {
            return;
        }

        const event = { title, price, date, description };

        const requestBody = {
            query: `
                mutation CreateEvent($title: String!, $description: String!, $price: Float!, $date: String!) {
                    createEvent(eventInput: {title: $title, description: $description, price: $price, date: $date"}) {
                        _id
                        title
                        description
                        date
                        price
                    }
                }
            `,
            variables: {
                title: title,
                description: description,
                price: price,
                date: date
            }
        };

        const token = this.context.token;

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            }
        })
        .then(res => {
            if(res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        }).then(resData => {
            this.setState(prevState => {
                const updatedEvents = [...prevState.events];
                updatedEvents.push({
                    id: this.context.userId,
                    title: resData.data.createEvent.title,
                    description: resData.data.createEvent.description,
                    date: resData.data.createEvent.date,
                    price: resData.data.createEvent.price,
                    creator: {
                        _id: this.context.userId
                    }
                });
                return {events: updatedEvents};
            });
        }).catch(err => {
            throw err;
        });
    }

    modalCancelHandler = () => {
        this.setState({creating: false, selectedEvent: null});
    }

    fetchEvents() {
        this.setState({isLoading: true});
        const requestBody = {
            query: `
                query {
                    events {
                        _id
                        title
                        description
                        date
                        price
                        creator {
                            _id
                            email
                        }
                    }
                }
            `
        };

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(res => {
            if(res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        }).then(resData => {
            const events = resData.data.events;
            this.setState({events: events, isLoading: false});
        }).catch(err => {
            this.setState({isLoading: false});
            throw err;
        });
    }

    showDetailHandler = eventId => {
        this.setState(prevState => {
            const selectedEvent = prevState.events.find(e => e._id === eventId);
            return {selectedEvent: selectedEvent};
        });
    }

    bookEventHandler = () => {
        if (!this.context.token) {
            this.setState({selectedEvent: null});
            return;
        }
        const requestBody = {
            query: `
                mutation BookEvent($id: ID!) {
                    bookEvent(eventId: $id) {
                        _id
                        createdAt
                        updatedAt
                    }
                }
            `,
            variables: {
                id: this.state.selectedEvent._id
            }
        };

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + this.context.token
            }
        })
        .then(res => {
            if(res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        }).then(resData => {
            console.log(resData);
            this.setState({selectedEvent: null});
        }).catch(err => {
            throw err;
        });
    }

    render() {
        const eventList = this.state.events.map(event => {
            return <li key={event._id} className="events__list-item">
                <div>
                    <h2>Name: {event.title}</h2>
                    <h3>Price: {event.price} Eur</h3>
                    <h3>Date: {new Date(event.date).toLocaleDateString('de-DE')}</h3>
                </div>
                <div>
                    {this.context.userId === event.creator._id ? <p>You are the owner of this event!</p>
                    : <button type="button" onClick={() => this.showDetailHandler(event._id)}>View Details</button>}
                </div>
            </li>;
        });

        return (
            <Fragment>
                {(this.state.creating || this.state.selectedEvent) && <Backdrop /> }
                {this.state.creating && <Modal
                    title="Add Event"
                    canCancel
                    canConfirm
                    confirmText='Confirm'
                    onCancel={this.modalCancelHandler}
                    onConfirm={this.modalConfirmHandler
                }>
                    <form>
                        <div className="form-control">
                            <label htmlFor="title">Title</label>
                            <input type="text" id="title" ref={this.titleElRef}></input>
                        </div>
                        <div className="form-control">
                            <label htmlFor="price">Price</label>
                            <input type="number" id="price" ref={this.priceElRef}></input>
                        </div>
                        <div className="form-control">
                            <label htmlFor="date">Date</label>
                            <input type="datetime-local" id="date" ref={this.dateElRef}></input>
                        </div>
                        <div className="form-control">
                            <label htmlFor="description">Description</label>
                            <textarea type="textarea" id="description" rows="4" ref={this.descriptionElRef}></textarea>
                        </div>
                    </form>
                </Modal>}
                {this.state.selectedEvent && <Modal
                    title={this.state.selectedEvent.title}
                    canCancel
                    canConfirm
                    confirmText={this.context.token ? 'Book' : 'Confirm'}
                    onCancel={this.modalCancelHandler}
                    onConfirm={this.bookEventHandler
                }>
                    <h3>Price: {this.state.selectedEvent.price} Eur</h3>
                    <h3>Date: {new Date(this.state.selectedEvent.date).toLocaleDateString('de-DE')}</h3>
                    <p>{this.state.selectedEvent.description}</p>
                </Modal>}
                {this.context.token && <div className="events-control">
                    <p>Create your events!</p>
                    <button onClick={this.startCreateEventHandler}>Create Event</button>
                </div>}
                <h2>Upcoming Events</h2>
                {this.state.isLoading ? <Spinner /> :
                    <ul className="events__list">
                    {eventList}
                    </ul>
                }
            </Fragment>
        );
    }
}

export default EventsPage;