import { Boundary } from '@/components/common';
import { useDocumentTitle, useScrollTop } from '@/hooks';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import api from '@/services/api';
import { displayActionMessage } from '@/helpers/utils';
import ReviewsNavbar from '../components/ReviewsNavbar';
import ReviewsTable from '../components/ReviewsTable';

const Reviews = () => {
    useDocumentTitle('Reviews Management | Salinaka Admin');
    useScrollTop();

    const [reviews, setReviews] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pagination & Search State
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [searchKey, setSearchKey] = useState('');
    const pageSize = 10;

    useEffect(() => {
        fetchReviews(currentPage, searchKey);
    }, [currentPage, searchKey]);

    const fetchReviews = async (page, keyword) => {
        setLoading(true);
        try {
            const data = await api.getAdminReviews(page, pageSize, keyword);
            setReviews(data.content || []);
            setTotalReviews(data.totalElements || 0);
            setTotalPages(data.totalPages || 0);
            setLoading(false);
        } catch (e) {
            setError(e.message || 'Failed to fetch reviews');
            setLoading(false);
        }
    };

    const onDeleteReview = async (id) => {
        try {
            const success = await api.deleteAdminReview(id);
            if (success) {
                displayActionMessage('Review deleted successfully', 'success');
                fetchReviews(currentPage, searchKey);
            } else {
                displayActionMessage('Failed to delete review', 'error');
            }
        } catch (e) {
            displayActionMessage(e.message || 'Failed to delete review', 'error');
        }
    };

    const onSearchChange = (e) => {
        const val = e.target.value;
        setSearchKey(val);
        setCurrentPage(0);
    };

    return (
        <Boundary>
            <div className="loader" style={{ display: isLoading ? 'flex' : 'none' }}>
                <div className="loader-renderer" />
            </div>
            <ReviewsNavbar
                reviewsCount={reviews.length}
                totalReviewsCount={totalReviews}
                onSearchChange={onSearchChange}
            />
            <div className="product-admin-items">
                {error && <div className="loader">{error}</div>}
                <ReviewsTable
                    baseIndex={currentPage * pageSize}
                    onDelete={onDeleteReview}
                    reviews={reviews}
                />

                {totalPages > 1 && (
                    <div className="d-flex-center margin-top-l">
                        <button
                            className="button button-small button-muted"
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            type="button"
                        >
                            Previous
                        </button>
                        <span className="margin-left-s margin-right-s">
                            Page {currentPage + 1} of {totalPages}
                        </span>
                        <button
                            className="button button-small button-muted"
                            disabled={currentPage >= totalPages - 1}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            type="button"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </Boundary>
    );
};

export default withRouter(Reviews);
