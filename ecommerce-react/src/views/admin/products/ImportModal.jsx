import { Modal } from '@/components/common';
import api from '@/services/api';
import React, { useState } from 'react';
import { displayActionMessage } from '@/helpers/utils';

const ImportModal = ({ isOpen, onRequestClose }) => {
    const [file, setFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    const onFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const onImport = async () => {
        if (!file) {
            displayActionMessage('Vui lòng chọn file Excel', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsImporting(true);
        try {
            await api.importProducts(formData);
            displayActionMessage('Nhập sản phẩm thành công!', 'success');
            onRequestClose();
            window.location.reload(); 
        } catch (e) {
            displayActionMessage(e.message || 'Nhập liệu thất bại', 'error');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
        >
            <div className="import-modal">
                <div className="import-modal-header">
                    <h3>Nhập sản phẩm thông minh (Excel)</h3>
                    <p>Chọn file Excel chứa thông tin sản phẩm và ảnh đã được chèn trực tiếp vào file.</p>
                </div>
                <div className="import-modal-content">
                    <div className="input-group">
                        <label htmlFor="excel-file">File Excel (.xlsx)</label>
                        <input
                            type="file"
                            id="excel-file"
                            accept=".xlsx, .xls"
                            onChange={onFileChange}
                        />
                    </div>
                </div>
                <div className="import-modal-footer">
                    <button
                        className="button button-muted button-small"
                        onClick={onRequestClose}
                        disabled={isImporting}
                    >
                        Hủy
                    </button>
                    <button
                        className="button button-small"
                        onClick={onImport}
                        disabled={isImporting || !file}
                    >
                        {isImporting ? 'Đang nhập...' : 'Bắt đầu Nhập'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ImportModal;
