import { PaginationProps } from "../interfaces/index.interface"


const Pagination = (props: PaginationProps) => {
    const {
        currentPage,
        totalPages,
        itemsPerPage,
        handlePrevious,
        handleNext,
        setCurrentPage,
        getPageNumbers,        
        setItemsPerPage
      } = props
    return (
        <div className="pagination-group">
            <div>
                <select value={itemsPerPage} onChange={(e) => {setItemsPerPage(Number(e.target.value));}}>
                    <option value="10">Show 10 Entries</option>
                    <option value="25">Show 25 Entries</option>
                    <option value="50">Show 50 Entries</option>
                    <option value="100">Show 100 Entries</option>
                </select>
                <p className="page-num">Page {currentPage} of {totalPages}</p>
            </div>
            <div className="pagination">
                <button type="button" className="page-item" onClick={handlePrevious} disabled={currentPage === 1} >Previous</button>
                {
                    getPageNumbers()
                        .slice(0, Math.min(4, getPageNumbers().length)) // Limit the range of the array to the first 4 elements
                        .map((pageNumber: number) => (
                            <button
                                type="button"
                                key={pageNumber}
                                className={`page-item ${pageNumber === currentPage ? 'active' : ''}`}
                                onClick={() => setCurrentPage(pageNumber)}
                            >{pageNumber}</button>
                        ))                                        
                }
                {getPageNumbers().length > 4 && <button type="button" className='page-item'>...</button>}

                {getPageNumbers().length > 4 && 
                <button
                    type="button"
                    className={`page-item ${currentPage === getPageNumbers().length ? 'active' : ''}`} 
                    onClick={() => setCurrentPage(getPageNumbers().length)}   
                >
                    {getPageNumbers().length}
                </button>}
                <button type="button" className="page-item" onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
            </div>
        </div>
    )
}

export default Pagination