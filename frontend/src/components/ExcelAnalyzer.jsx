import React, { useState } from 'react';
import { read, utils } from 'xlsx';
import { Button, Typography, Box, Accordion, AccordionSummary, AccordionDetails, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import { apiKey } from '../const'; // Make sure to import your API key
import { formatSummary } from '../helper'; // Add this import at the top of the file
import trizData from '../data/triz.json'; // Add this import

const ExcelAnalyzer = ({ onDataAnalyzed, isDarkMode }) => {
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) {
            console.error('No file selected');
            return;
        }
        setIsLoading(true);
        const reader = new FileReader();

        reader.onload = (event) => {
            const bstr = event.target.result;
            let data;

            try {
                if (file.name.endsWith('.csv')) {
                    // Parse CSV
                    data = parseCSV(bstr);
                } else {
                    // Parse Excel
                    const workbook = read(bstr, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    data = utils.sheet_to_json(worksheet, { header: 1 });
                }

                // Perform basic analysis
                analyzeData(data).then(analysis => {
                    setAnalysisResult(analysis);
                    onDataAnalyzed(analysis);
                    setIsLoading(false);
                }).catch(error => {
                    console.error('Error analyzing data:', error);
                    setAnalysisResult({ error: 'Failed to analyze data. Please try again.' });
                    setIsLoading(false);
                });
            } catch (error) {
                console.error('Error parsing file:', error);
                setAnalysisResult({ error: 'Failed to parse file. Please check the file format and try again.' });
                setIsLoading(false);
            }
        };

        reader.onerror = (error) => {
            console.error('FileReader error:', error);
            setAnalysisResult({ error: 'Failed to read file. Please try again.' });
            setIsLoading(false);
        };

        reader.readAsBinaryString(file);
    };

    const parseCSV = (str) => {
        const lines = str.split('\n');
        return lines.map(line => line.split(',').map(value => value.trim()));
    };

    const analyzeData = async (data) => {
        if (!Array.isArray(data) || data.length === 0) {
            return {
                error: 'Invalid or empty data. Please check your file and try again.'
            };
        }

        const headers = data[0];
        const rows = data.slice(1);

        // Prepare all data as a string
        const allDataAsString = data.map(row => row.join(', ')).join('\n');

        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Phân tích dữ liệu Excel này và cung cấp thông tin chi tiết:
                                    Dữ liệu:
                                    ${allDataAsString}
                                    
                                    Vui lòng cung cấp một báo cáo phân tích toàn diện, chi tiết và chuyên sâu về dữ liệu này, với độ dài tối thiểu 10,000 từ. Hãy phân tích như một chuyên gia dữ liệu có kinh nghiệm, bao gồm nhưng không giới hạn ở các phần sau:

                                    1. Tóm tắt tổng quan:
                                    - Mô tả ngắn gọn về bộ dữ liệu
                                    - Các phát hiện chính và điểm nổi bật

                                    2. Phân tích cấu trúc dữ liệu:
                                    - Mô tả chi tiết về cấu trúc của bộ dữ liệu
                                    - Phân tích về chất lượng và tính nhất quán của dữ liệu
                                    - Đánh giá về tính đầy đủ và phù hợp của các trường dữ liệu

                                    3. Phân tích thống kê mô tả:
                                    - Thống kê chi tiết cho mỗi trường dữ liệu (min, max, trung bình, trung vị, độ lệch chuẩn, etc.)
                                    - Phân phối của các biến số quan trọng
                                    - Xác định và giải thích các xu hướng chính

                                    4. Phân tích tương quan và mối quan hệ:
                                    - Xác định và mô tả chi tiết các mối tương quan giữa các biến
                                    - Phân tích các mẫu và xu hướng tiềm ẩn trong dữ liệu
                                    - Đề xuất và giải thích các giả thuyết về mối quan hệ nhân quả

                                    5. Phân tích theo thời gian (nếu có):
                                    - Xác định và mô tả các xu hướng theo thời gian
                                    - Phân tích tính mùa vụ hoặc chu kỳ trong dữ liệu

                                    6. Phân đoạn và phân nhóm:
                                    - Xác định và mô tả các phân đoạn hoặc nhóm trong dữ liệu
                                    - Phân tích đặc điểm và hành vi của từng phân đoạn

                                    7. Phát hiện điểm bất thường và giá trị ngoại lai:
                                    - Xác định và mô tả chi tiết các điểm bất thường hoặc giá trị ngoại lai
                                    - Phân tích nguyên nhân và tác động tiềm tàng của các điểm bất thường

                                    8. Đánh giá chất lượng dữ liệu:
                                    - Xác định và mô tả các vấn đề về chất lượng dữ liệu (ví dụ: giá trị thiếu, không nhất quán, lỗi nhập liệu)
                                    - Đề xuất các phương pháp để cải thiện chất lượng dữ liệu

                                    9. Phân tích sâu theo từng lĩnh vực cụ thể:
                                    - Dựa vào bản chất của dữ liệu, cung cấp phân tích chuyên sâu về các khía cạnh liên quan (ví dụ: tài chính, marketing, vận hành, etc.)

                                    10. Đề xuất cho phân tích và trực quan hóa sâu hơn:
                                        - Đề xuất các phương pháp phân tích nâng cao (ví dụ: mô hình dự đoán, phân tích hồi quy)
                                        - Gợi ý các loại biểu đồ và trực quan hóa phù hợp để minh họa các phát hiện chính

                                    11. Đánh giá tổng thể và nhận xét:
                                        - Đánh giá tổng quan về ý nghĩa và giá trị của bộ dữ liệu
                                        - Nhận xét về độ tin cậy và hạn chế của dữ liệu

                                    12. Ứng dụng phương pháp TRIZ để giải quyết vấn đề:
                                        - Xác định các vấn đề chính từ dữ liệu
                                        - Áp dụng các nguyên tắc TRIZ để đề xuất giải pháp sáng tạo

                                    13. Đề xuất và khuyến nghị:
                                        - Đưa ra các đề xuất cụ thể dựa trên phân tích dữ liệu
                                        - Cung cấp các khuyến nghị chi tiết cho việc sử dụng và khai thác dữ liệu

                                    14. Kế hoạch hành động:
                                        - Đề xuất các bước tiếp theo cụ thể để tận dụng tối đa giá trị của dữ liệu
                                        - Xác định các lĩnh vực cần nghiên cứu hoặc thu thập dữ liệu thêm

                                    Vui lòng đảm bảo rằng báo cáo được viết với ngôn ngữ chuyên nghiệp, rõ ràng và dễ hiểu. Sử dụng các ví dụ cụ thể từ dữ liệu để minh họa cho các điểm phân tích. Định dạng báo cáo bằng Markdown để dễ đọc và có cấu trúc rõ ràng.`
                                }
                            ]
                        }
                    ]
                }
            );

            const analysis = response.data.candidates[0]?.content?.parts[0]?.text;

            // Apply TRIZ principles
            const trizAnalysis = applyTRIZ(analysis);

            return {
                rowCount: rows.length,
                columnCount: headers.length,
                deepAnalysis: analysis,
                trizAnalysis: trizAnalysis,
                rawData: allDataAsString // Include the raw data in the response
            };
        } catch (error) {
            console.error('Error analyzing data with Gemini:', error);
            return {
                rowCount: rows.length,
                columnCount: headers.length,
                error: 'Failed to perform deep analysis. Please try again.'
            };
        }
    };

    const applyTRIZ = (analysis) => {
        // Extract key problems or challenges from the analysis
        const problems = extractProblems(analysis);

        // Find relevant TRIZ parameters and principles
        const trizSuggestions = problems.map(problem => {
            const relevantParameter = findRelevantParameter(problem);
            const suggestedPrinciples = getSuggestedPrinciples(relevantParameter);
            return {
                problem,
                parameter: relevantParameter,
                principles: suggestedPrinciples
            };
        });

        return trizSuggestions;
    };

    const extractProblems = (analysis) => {
        // This is a simplified example. In a real-world scenario, you might use
        // more advanced NLP techniques to extract problems from the analysis text.
        const problemKeywords = ['challenge', 'issue', 'problem', 'difficulty'];
        const sentences = analysis.split('.');
        return sentences.filter(sentence => 
            problemKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
        );
    };

    const findRelevantParameter = (problem) => {
        // This is a simplified matching. You might want to use more sophisticated
        // text matching or ML techniques for better accuracy.
        return trizData.parameters.find(param => 
            param.synonyms.some(synonym => problem.toLowerCase().includes(synonym.toLowerCase()))
        ) || trizData.parameters[0]; // Default to first parameter if no match found
    };

    const getSuggestedPrinciples = (parameter) => {
        const principles = parameter.always_consider_principles.concat(parameter.averaged_principles);
        return principles.map(principleNumber => 
            trizData.inventive_principles.find(p => p.number === principleNumber)
        );
    };

    return (
        <Box>
            <Button
                variant="contained"
                component="label"
                color={isDarkMode ? "secondary" : "primary"}
                disabled={isLoading}
            >
                {isLoading ? 'Đang xử lý...' : 'Tải lên tệp Excel hoặc CSV'}
                <input
                    type="file"
                    hidden
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                />
            </Button>
            {isLoading && (
                <Box display="flex" justifyContent="center" mt={2}>
                    <CircularProgress />
                </Box>
            )}
            {analysisResult && !isLoading && (
                <Accordion sx={{ mt: 2 }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="analysis-content"
                        id="analysis-header"
                    >
                        <Typography variant="h6">Kết quả phân tích</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {analysisResult.error ? (
                            <Typography color="error">{analysisResult.error}</Typography>
                        ) : (
                            <>
                                <Typography>Số cột: {analysisResult.columnCount}</Typography>
                                <Typography>Số hàng: {analysisResult.rowCount}</Typography>
                                {analysisResult.deepAnalysis && (
                                    <Box mt={2}>
                                        <Typography variant="h6">Phân tích sâu:</Typography>
                                        {formatSummary(analysisResult.deepAnalysis)}
                                    </Box>
                                )}
                                {analysisResult.trizAnalysis && (
                                    <Box mt={2}>
                                        <Typography variant="h6">Phân tích TRIZ:</Typography>
                                        {analysisResult.trizAnalysis.map((suggestion, index) => (
                                            <Box key={index} mt={1}>
                                                <Typography><strong>Vấn đề:</strong> {suggestion.problem}</Typography>
                                                <Typography><strong>Tham số TRIZ:</strong> {suggestion.parameter.name}</Typography>
                                                <Typography><strong>Nguyên tắc đề xuất:</strong></Typography>
                                                <ul>
                                                    {suggestion.principles.map((principle, i) => (
                                                        <li key={i}>{principle.number}. {principle.name}: {principle.description}</li>
                                                    ))}
                                                </ul>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </>
                        )}
                    </AccordionDetails>
                </Accordion>
            )}
        </Box>
    );
};

export default ExcelAnalyzer;