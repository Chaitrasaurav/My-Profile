import React, { Component, Fragment } from 'react';
import AuthContext from '../context/auth-context';
import Spinner from '../components/spinner/spinner';
import { Bar } from 'react-chartjs';

class BookingsPage extends Component {
    state ={
        isLoading: false,
        bookings: [],
        outputType: 'list'
    }

    static contextType = AuthContext;

    componentDidMount() {
        this.fetchBookings();
    }

    fetchBookings = () => {
        this.setState({isLoading: true});
        const requestBody = {
            query: `
                query {
                    bookings {
                        _id
                        createdAt
                        event {
                            _id
                            title
                            date
                            price
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
                Authorization: 'Bearer ' + this.context.token
            }
        })
        .then(res => {
            if(res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        }).then(resData => {
            const bookings = resData.data.bookings;
            this.setState({bookings: bookings, isLoading: false});
        }).catch(err => {
            this.setState({isLoading: false});
            throw err;
        });
    };

    onDelete = bookingId => {
        this.setState({isLoading: true});
        const requestBody = {
            query: `
                mutation CancelBooking($id: ID!) {
                    cancelBooking(bookingId: $id) {
                        _id
                        title
                    }
                }
            `,
            variables: {
                id: bookingId
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
            this.setState(prevState => {
                const updatedBookings = prevState.bookings.filter(booking => {
                    return booking._id !== bookingId;
                });
                return {bookings: updatedBookings, isLoading: false};
            });
        }).catch(err => {
            this.setState({isLoading: false});
            throw err;
        });
    };

    changeOutputTypeHandler = outputType => {
        if (outputType === 'list') {
            this.setState({outputType: 'list'});
        } else {
            this.setState({outputType: 'chart'});
        }
    }

    render() {
        const BOOKING_BUCKETS = {
            'Cheap': {
                min: 0,
                max: 100
            },
            'Normal': {
                min: 100,
                max: 200
            },
            'Expensive': {
                min: 200,
                max: 10000000
            }
        };
        const chartData = {labels: [], datasets: []};
        let values = [];

        for (const bucket in BOOKING_BUCKETS) {
            const filteredBookingsCount = this.state.bookings.reduce((prev, current) => {
                if (current.event.price > BOOKING_BUCKETS[bucket].min && current.event.price < BOOKING_BUCKETS[bucket].max) {
                    return prev +  1;
                } else {
                    return prev;
                }
            }, 0);
            values.push(filteredBookingsCount);
            chartData.labels.push(bucket);
            chartData.datasets.push({
                fillColor: 'rgba(220,220,220,0.5)',
                strokeColor: 'rgba(220,220,220,0.8)',
                highlightFill: 'rgba(220,220,220,0.75)',
                highlightStroke: 'rgba(220,220,220,1)',
                data: values
            });
            values = [...values];
            values[values.length - 1] = 0;
        };

        let content = <Spinner />;
        if(!this.state.isLoading) {
            content = (
                <Fragment>
                    <div>
                        <button onClick={() => this.changeOutputTypeHandler('list')}>List</button>
                        <button onClick={() => this.changeOutputTypeHandler('chart')}>Chart</button>
                    </div>
                    <div>
                        {this.state.outputType === 'list' ?
                        <ul>
                            {this.state.bookings.map(booking => (
                                <li key={booking._id}>
                                    <div>{booking.event.title} - {new Date(booking.createdAt).toLocaleDateString()}</div>
                                    <div><button onClick={() => this.onDelete(booking._id)}>Cancel</button></div>
                                </li>
                            ))}
                        </ul>:
                        <div>
                            <Bar data={chartData} />
                        </div>}
                    </div>
                </Fragment>
            );
        }
        return (
            <Fragment>
                {content}
            </Fragment>
        );
    }
}

export default BookingsPage;