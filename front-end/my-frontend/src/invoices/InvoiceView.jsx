// import { useState, useEffect } from 'react';
// import { useApi } from '../services/apiService';
// import PaymentModal from './PaymentModal';
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';

// // ✅ REPLACE THIS WITH YOUR ACTUAL BASE64 IMAGE STRING
// // Example format: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
 //const COMPANY_LOGO_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAQDAwQDAwQEAwQFBAQFBgoHBgYGBg0JCggKDw0QEA8NDw4RExgUERIXEg4PFRwVFxkZGxsbEBQdHx0aHxgaGxr/2wBDAQQFBQYFBgwHBwwaEQ8RGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhr/wAARCABlAKoDASIAAhEBAxEB/8QAHQAAAgIDAQEBAAAAAAAAAAAAAAgGBwMEBQECCf/EAEsQAAEDAwMABQYHDQYGAwAAAAIBAwQABQYHERIUISIxMggTQUJRchVSYWKBgpIWIyQzVXGRk5ShsbLRFxglN1aiQ0RTY4TCdJXh/8QAGgEAAwEBAQEAAAAAAAAAAAAAAAQFAwIGAf/EADgRAAEDAgIHBAkCBwAAAAAAAAIAAQMEEgURExQhIjFBUTJSkZIVQmFicXKBoeGxwSMkM0NTorL/2gAMAwEAAhEDEQA/AH4f8Ce9WvWw/wCBPerXoQiiihEIvDQhFFe8SH1a8oQiiiihCKKKKEIooooQiiiihCKKEHl4aFQh8VCEUUUUIRRRRQhFFFFCFme8KfnqN5Vl9mwu2LcMjmtw46dQIvWbhewB9ZakbyKgjsvVvS32zRe+ZTlNyv2s01Z0OI4axYrLu4OAm6+H0Bt6tM08cUlxSlazeL/BIVc00YsMIXO/g3xWOVrbm+oEk42k2MuNRELbp8kBL6eRdhP91fK6VatXpPP5Hn6W0V6+DT58R+zxGpHqBlGZWJ+04xpjjbMfpkfzjTzSIfmQ7u7wh7y1HWPJ3y/KF6Zn+Zvq8fWTLJKe31i7P+2q4HGA5taDeYlAkjllMgK+R/jYC+R0g1HjH5ywam9LeT1ClH/Uq+2801j09fbDLrIGSW8jEPPMiKl1rt4x7vrDWZ7yUkjp5yyZfcI0ke0hOJ1b/V2rkSrnqroyPLJEHLMY8DpqSnxD8/eH8tdicc+wSE/Y42l9Fk8ctNvkJx+1nvb6imOtNzcntD0mGcKTwEzZMkLjv84e+uivUlUTk+b3LJNNgu+jKvuS3JAhNAO3JYTbw8Sqc6SZRNyfDozt/P8AxuIpMXFow4GDqe0fbUeWnKOPSe3LLmvRxVgSy6MemefJ1XGrOP6r3DMX38Ekz2bOrACAszRaHnt19neqYvuQ6pY3fWbJeL9do1ze4cGencuXPu7W9PWi70omuv8AnrZ//E/mqrh1RpS0LgOwei8/i9HoR04GWbl13dqzQMT12GfEKVMuvmBdBXeVyHw8uv1qjK5FqTlOc3Wx4xf7k5JbkPebZ6aoCIAtO5STYHldqwzWq8XXIX1jQhflgRoHPtKXZ6q0pKh6gTewcxHZurOupBpCiDSlaRb2ZKQfcXr16bjcP/tauXPtUh0tw61/CidMyJ+KAAwp78nUFOZmXs3rxvyiMAdMBbuj25kgp+ClVC5iS6n6/M2yQalC6U1FAfY0g8i/mrgAOpk/mQtEd7s5LWSSKiiLVJbzMhbjnkssD+2XVkVuEGZNYt7i9gkk9EZ+oieKpThmK6v4tmFoZu0+Y9ZnHdpRpL6Q3wEevcS8NMzEiNW+M1GhtgxHZBAbAE4oIp6Kyu/ij90qUPESJnBgHL4J+PCBDIzlIj+ZLFoZmeQ33VW8QLveZ06E03LIGH31MB4u7J2aZ+kg0pze04FqdebpkJvNxV6WyJNhzXkrvxfq1f395vAfTIn/ALJ/+1viNJKc+cYbMvVS+E10AU+U0u9mXadV7ptmeQ3LX242m4XmbJtgSpwjFceVW0EOfHq+SmkTupNdFp7N18oJ+4Q1Uo0x64OtEQ7LwJDVKcr0VhiYDHKIiPIU1gshS05kT3b5IoooqSryzveBOrbrrAo8k2Xw1neXsJ+eoPnmpdh05ZhOZE86KzDIGgZDmS7eJfzJySuwEjLIG2rOSQIgvMsmUoiQI0JSWKyDRF4lStwXlTvXeq0TXvT4kRfuhZ+wVH9vWnv+oGfsFW2q1HcLypZq2jb+63iytETQ06lT9FY5EZqYy4xKbF1lwdjAh3Qkqsv7etPf9Qs/YWvodftP078iZ/VrXzVajuF4I1yl/wAo+KqW9QHNANVIFztKmGJ30/Nvscuppd+tPq8t0+SrSuXDEtSrXdoi7WvKA6LL28PSBHk0f0p2ag2sme4bqXhzlmx66Nzr2bwFAZAF5G5y22GpJf4893ReKd2aJm+WJuPJcBe8DaUf/WqZs5iDybCfdL9nUOKyI5WifMB32y5dWVx0omuv+etn/wDE/npsLZMGfbocsPDIYBz7Q8qVDXRoy10s5CBkn4J2kH51Z4Xu1BfKSZxzepRy7wput6SXBsRtmb603i039snYRvyzJAMgXkJdXXTtbUh9szKZp7qner3Dt/TnQlSm/NmJChciX2VrhgmQStHxtWGNOAnTvJwu2plm/JuwBpwDGBK5ASKP4UdUQ46GFeUejlx+9RwuidZegDFBFakn962+Ii7YtH+0ddjVbTudqli1kzewxBbvbkQTkwwL8aHyfOSmomqITtqy3T3e0kah6WqjvoR3gJi4ZJlE7urtV8u/ij91aT7FfKMybCogWjKLWtxSMnmwJ/dp4UH0L8apljHlG3nMcttVrhWEI1ukP8JBoJOmIr6eXhSpp4ZUhmXJV48ao5bRu2vyyVaaTYZac81QvVsyJk34Y9LeEQNQXkjvxk96mB/u16f/AJOlftR1UHk8NG3rHfCMDFPNTO0Q/wDdpu6bxOpninyA3ZrWSeD0lPPT3yALvcSTfReAzavKBkQIYkMaI7cGWkUuWwCholORSg6UtGPlI3IibMR6VcutUXb16b5awxV7px+UUxgTW05t75fsiiiio69Esrqfe03276rzUjC8ezVuIzk0J+V8HiUgTYPgrbfp3+QuPh+bXP8AKGut+s2nD8nFDdZd6U2kl5nxtx9i5Ens7XBPpqOeTzJu2W4S/Iyx1+Y23KNmG+6fbda2HkhF6U58qeihMIdaEuy/1UqaoCWo1IguzbP2LXSy6E7J1Wj9adfXwLoT7LR+sOrm+AbT+S4X7KH9KPgG1fkuF+yh/SvutP3j8y51H3A8v5VM/AuhPstH6w6PgXQn2Wj9YdXN8A2r8lwv2UP6UfANq/JcL9lD+lGtP3j8yNR9wPL+VT8a36IwZLMmE5a2JLJobToOmigXtSu3kef4U9il9hs5DFkPS4TopycUjM+C7VYvwHaeW3wXB3/+OH9KPgK1fkuD+yh/SuSmAiZyuf6rsaWUBdgsHP3fyuRpy+r+B466aEpFBa7/AHa8vmW4fZ5P+PXO1MSR/wCsQKaVUnlAarSsVbj4nihdHuUhtFfdZHrZAu4A+cVRfDvJflXyE3cs1ursORJHn0dtObg7/HIvTTIUsej0852C/DqkZK+Vj1WlC9w4vyTFWfO8ayB7zNmvkGY98QHh5L9FdU7dbxQ3HocT2masj+nuqjrB5MsLGcvtN5gXlyRGhPedNh5rYy27uJDU/wBZ8m+5bTm8zBXi+810dj3z7NLFFEUohAV1yejnnGE5KoGG1de2XvD73L6HapFoly+Kr5pkQIurxeipKAA02IgiAA+FEHiKV+feml3ewvN8cvDwEyw66gkS+u0S8Cp/5hIUJ8hXkhMEqL9Fa19JqpiLFczrHC6/X4idxtcVErvk2AG+Xw1cbG68Hi88QGSV1MeuWLTN0xd+1GXrDF4b/upNNItNIGpmVXe33SU7DbjgbwmyiKpFz29au1qjpJM0aO33/Gbw+4wb4tofHg42feO/HxJ2afOggE9BpXv/ANVMDFKoota0I2fNvJtp92x/HHQW5yYFsdeFfNk4oNkftrWXP8V/1Bbf2gaVHXDJHcxxbTq8ywTpEmDIR/iProYCS/u3qY2ryUYVwtcGWuRPCsmOD3Doo9nkiLt3/LS+pwRxCc52uWf2THpKqlmKOliYhHLnlxZMXZ59ju6uybE9BmGBcTejcSJCX2kNdeq70m0sZ0sg3GLHuBzknPg6qk1w4bJtViVLlYGMmB82V6ncyiF5BydFFFFZLdYrvAZultlwJQ8o8tk2XU9qGKov8aXjyfry/iF8yHTe/F5uZCkm7CQ/+IPrIn5+o/rUyT23EdvbVJa2aYTr8cTLMJJWMqtfEx832VfAf4mn707NPUpgQlDJwL7OpNdHILhURtmQcurc1c9FU9pnrxaMrYbtuTON2TJGvvbrL/YB0/aCl/Dvq4UJCQVEkIS9ZKWliOErDFOwVEVUF8ZXLzf6K8ccBpszdNAAE3VVLZESolqTdcjs+JypeEwBuN2AwQGeHPsb9pdvTVI3Swat53CUs+u0TEMd47yEU0a7HyoK7/QpDW0FPpRvc2Fvv4JaprdCVgA5P9vFTS16t2u/XLI3rcw+MSxKbrt0M/vJAgrsCJ8perWbQDIclyqxXK75VMWXFflkkDm2iEgj4voqnWoLecSIunWlLTzeMx3Rcu11MeJSS9Y1X2fFSmzsNjh43aIVqtjYtRIjSNAP5vTTlWMUEdjDvF5hb8qdQHPUy6Ry3Rz4cCd/1ZkpEdhMq8pkwuX3xoLoXZX4rQ9lKcmkvzd5zTPX5bxIBUiFLGWJe1o/FTjW25RLvBYnW10JEV8ENpwC3EhWusSbMYjbhajBiETmB+3eS2vRSxeVZkBy5NgxeGvJ0y6Q6A+1eyFM7399JLkcCbrPrVcoVofBhOZNtPHy2baa9bs/OrjCwbTvIfANq0xyQtXGEOJlapPrpgLOP6d4ZJhKHnrW0MaQod/b69/t1e+meSDlemVuuKnu90JWX/fBNv6VQl48mXKYlrmSDyRmeMdonPMeceLnt2tuvqrr+S1kqlaslx98+toFlsgvo6uJ/wDrTlQEctHcB3uBf9KbSSHT19pxWMY5eVVvo7qLbdNMqvFwvTMh9mQ0bIIwKEvLnvXb1L1Sm62zLVjOJ2p1mOUjmAOkPN49ur3UTtV9eTrjdoybN79GyC3sXFhqOZgDw8kQvO99bGv+DQ9Nsksl9w9pbazKIi4NEuzTwdrdPZuP8tUHeAq7K3fy2d1SgGqHDbs/4d21vW7S1te8X+47H9PbEpoZxIUhHTT0mqgRf7lrrW3ypbxb7dDhN41GNIzAMofnz69hRN/D8la3lIXscjten92bIfwy3m6XH2lw3/fvTOY1aYBY3ZiWDGI1gMKu7Adf3tPkpGWUApYnnC5979VSgglkrZmpZbGZh5Z8lwNINQ5epOOSbpPt7dvcZlkwLYGq7oKCu/X71WF3p11iYjsxQ4RmW2A79mwQU/dWWvPSOJmTg1rL10IGACJvc/VFFFFcLZbD/gT3q162H/AnvVr0IVcZ9ori2oClJnxFg3Nf+di7Car88e4/41Wrek2rWFl5vB8xbnQE8DMk9th90xJP0LTIIm3eu9e03HWTxDZ2m6PtU2XDqeU9J2S6tsS5DZPKDmjwcvFviD8dCZT+ArXjPk9ZVlMltzU/NHZjAlusaMZH/HZB+yVMdRW2vyt2BEflFY+ioC/qER/MS4WKYjZ8MtYW7HYQRIyd+ybmZfGNfStd2iip7uRvm6rAAgNoNkyrzVfSmBqbaW23HEh3SNusWVx34/IvtSl4i6fazadOORsaScsTl2egPg80Xy8C7vs05VeKPsp6CulgDR5MQ+1SqrDIao9Nm4H1ZKhaca1yulxaulzWW4kUTJtiZMBkTUh224D6feqZeT9pTfcKud5u2XQxizHwRtlPOgaqKrua9lav3rr3rruTEDkAgYRFn6LiLCYopRkcyJ26kvkxEwIDTkhDsqUsmLaSZfhurEq52y2i7j7zzwecSQH4lxF9Xfl2SWmdrzftbfJS8FQcIkzesnKijjqSAj4htS6aA6a5PhmYXmfklsWDFkRzBo1dA9y57+qvsqb6+YHPzvCwjWFjpFziSgeab5CPMe4k5L80qtWiuzrJTqGn9ZllHh0QUr0vJ0neQaT6gXvD8UtbmPuFLs/Smi3kteAyFQ9b8/6K+mMN13jsttMvXYG2hEGwGezxER7k8VOD1e399e016UkttcBSPoSHPNjNuHPp9FTOh9p1Dtku8rqU7McZNtronSZAO9e5ctuP1auVdvTQooq9adde7VOml0x3uOXwVimganiaNnd/iiiiisUyth/wJ71a9FFCEUUUUIRRRRQhFFFFCEUUUUIRRRRQhFFFFCEUUUUIRRRRQhFFFFCEUUUUIX//2Q==';

// const InvoiceView = ({ invoiceId, onClose, onRefresh }) => {
//   const { apiCall } = useApi();
//   const [invoice, setInvoice] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showPaymentModal, setShowPaymentModal] = useState(false);

//   useEffect(() => {
//     const fetchInvoice = async () => {
//       try {
//         setLoading(true);
//         const data = await apiCall(`/api/invoices/${invoiceId}`);
//         setInvoice(data);
//       } catch (err) {
//         setError('Failed to load invoice');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (invoiceId) {
//       fetchInvoice();
//     }
//   }, [invoiceId]);

//   const handlePaymentSuccess = (response) => {
//     setInvoice(response);
//     setShowPaymentModal(false);
//     if (onRefresh) onRefresh();
//   };

//   const generatePreviewHTML = () => {
//     if (!invoice) return '';

//     const jobNumber = invoice.jobCard?.jobNumber || 'N/A';
//     const paymentMethod = invoice.paymentMethod || 'Cash';
    
//     // Generate services HTML from job card
//     const servicesHTML = (invoice.jobCard?.serviceCategories || []).map((service, index) => `
//       <tr>
//         <td>${index + 1}</td>
//         <td>SERVICE</td>
//         <td>${service.name} ${service.description ? `(${service.description})` : ''}</td>
//         <td>Service</td>
//         <td>-</td>
//         <td>1</td>
//         <td>${(service.servicePrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//         <td>${(service.servicePrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//       </tr>
//     `).join('');
    
//     // ✅ Generate parts HTML with itemCode, warranty AND warrantyNumber
//     const itemsHTML = (invoice.items || []).map((item, index) => `
//       <tr>
//         <td>${(invoice.jobCard?.serviceCategories?.length || 0) + index + 1}</td>
//         <td>${item.itemCode || item.sku || 'N/A'}</td>
//         <td>${item.itemName || 'Item'}</td>
//         <td>${item.warranty || 'No Warranty'}</td>
//         <td>${item.warrantyNumber || '-'}</td>
//         <td>${item.quantity || 0}</td>
//         <td>${(item.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//         <td>${(item.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//       </tr>
//     `).join('');

//     return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
// <meta charset="UTF-8">
// <title>E-TechCare Invoice (A5)</title>
// <style>
//     @page {
//         size: A5;
//         margin: 10mm;
//     }
//     body {
//         font-family: Arial, sans-serif;
//         font-size: 10px;
//         margin: 0;
//         padding: 0;
//         color: #000;
//         line-height: 1.3;
//     }

//     /* HEADER */
//     .header {
//         display: flex;
//         justify-content: space-between;
//         align-items: flex-start;
//         padding-bottom: 8px;
//         margin-bottom: 10px;
//         border-bottom: 3px solid #000;
//     }
//     .header-left {
//         display: flex;
//         align-items: center;
//         gap: 12px;
//     }
//     .logo {
//         width: 80px;
//         height: 60px;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         padding: 3px;
//         background-color: #fff;
//     }
//     .logo img {
//         width: 100%;
//         height: 100%;
//         object-fit: contain;
//     }
//     .company-info h1 {
//         font-size: 24px;
//         margin: 0;
//         font-weight: 900;
//         letter-spacing: 2px;
//         color: #111;
//     }
//     .company-details {
//         text-align: right;
//         line-height: 1.5;
//         font-size: 9px;
//     }
//     .company-details p {
//         margin: 2px 0;
//     }

//     /* TITLE */
//     h2 {
//         text-align: center;
//         margin: 8px 0;
//         font-size: 18px;
//         letter-spacing: 1px;
//         border-top: 2px solid #000;
//         border-bottom: 2px solid #000;
//         padding: 6px 0;
//         background-color: #f5f5f5;
//         font-weight: bold;
//     }

//     /* INVOICE DETAILS - List Style */
//     .invoice-details {
//         margin-bottom: 10px;
//         font-size: 9px;
//         line-height: 1.6;
//         display: grid;
//         grid-template-columns: 1fr 1fr;
//         gap: 3px 15px;
//     }
//     .invoice-details p {
//         margin: 0;
//     }
//     .invoice-details .full-width {
//         grid-column: 1 / -1;
//     }
//     .invoice-details b {
//         display: inline-block;
//         min-width: 110px;
//     }

//     /* ITEM TABLE */
//     table {
//         width: 100%;
//         border-collapse: collapse;
//         font-size: 9px;
//     }
//     th, td {
//         border: 1px solid #000;
//         padding: 4px 3px;
//         text-align: center;
//     }
//     th {
//         background-color: #e8e8e8;
//         font-weight: bold;
//         font-size: 9px;
//     }
//     td {
//         font-size: 9px;
//     }

//     /* TOTAL SECTION */
//     .totals {
//         width: 100%;
//         border-collapse: collapse;
//         margin-top: 8px;
//         font-size: 10px;
//     }
//     .totals td {
//         padding: 4px;
//         text-align: right;
//         border: none;
//     }
//     .totals .label {
//         width: 80%;
//         text-align: right;
//         font-weight: bold;
//     }
//     .totals .value {
//         width: 20%;
//         border-bottom: 1px solid #000;
//     }
//     .totals .highlight {
//         font-weight: bold;
//         border-top: 2px solid #000;
//         padding-top: 6px;
//     }

//     /* NOTICE */
//     .notice {
//         margin-top: 15px;
//         font-size: 8px;
//         line-height: 1.4;
//     }
//     .notice b {
//         display: block;
//         margin-bottom: 3px;
//         font-size: 9px;
//     }
//     ul {
//         margin-top: 0;
//         padding-left: 15px;
//     }
//     ul li {
//         margin-bottom: 2px;
//     }

//     /* SIGNATURES */
//     .signatures {
//         margin-top: 25px;
//         display: flex;
//         justify-content: space-between;
//         font-size: 9px;
//     }
//     .signatures div {
//         width: 45%;
//         text-align: center;
//     }
//     .signatures hr {
//         border: none;
//         border-top: 1px solid #000;
//         margin-bottom: 3px;
//     }
// </style>
// </head>
// <body>

// <div class="header">
//     <div class="header-left">
//         <div class="logo">
//             <img src="${COMPANY_LOGO_BASE64}" alt="E-TechCare Logo">
//         </div>
//         <div class="company-info">
//             <h1>E-TECHCARE</h1>
//         </div>
//     </div>
//     <div class="company-details">
//         <p><b>ADDRESS:</b> No.158, Wakwella Road, Galle</p>
//         <p><b>TEL:</b> 076 795 7125</p>
//         <p><b>EMAIL:</b> etechcarelh@gmail.com</p>
//         <p><b>WHATSAPP:</b> 076 795 7125</p>
//     </div>
// </div>

// <h2>INVOICE</h2>

// <div class="invoice-details">
//     <p><b>DATE:</b> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
//     <p><b>USER:</b> Admin</p>
//     <p><b>INVOICE NO:</b> ${invoice.invoiceNumber}</p>
//     <p><b>JOB NO:</b> ${jobNumber}</p>
//     <p><b>PAYMENT METHOD:</b> ${paymentMethod}</p>
//     <p class="full-width"><b>CUSTOMER:</b> ${invoice.customerName}</p>
//     <p class="full-width"><b>CONTACT NUMBER:</b> ${invoice.customerPhone}</p>
// </div>

// <!-- Items Table -->
// <table>
//     <thead>
//         <tr>
//             <th style="width: 5%;">No</th>
//             <th style="width: 11%;">Item Code</th>
//             <th style="width: 28%;">Description</th>
//             <th style="width: 11%;">Warranty</th>
//             <th style="width: 11%;">Warranty No</th>
//             <th style="width: 7%;">QTY</th>
//             <th style="width: 13%;">Unit Price</th>
//             <th style="width: 14%;">Amount</th>
//         </tr>
//     </thead>
//     <tbody>
//         ${servicesHTML}
//         ${itemsHTML}
//     </tbody>
// </table>

// <!-- Total Section -->
// <table class="totals">
//     <tr>
//         <td class="label highlight">SUB TOTAL</td>
//         <td class="value highlight">${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//     </tr>
//     <tr>
//         <td class="label">DISCOUNT</td>
//         <td class="value">${invoice.discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//     </tr>
//     <tr>
//         <td class="label">ADVANCE</td>
//         <td class="value">${invoice.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//     </tr>
//     <tr>
//         <td class="label">BALANCE</td>
//         <td class="value">${invoice.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//     </tr>
// </table>

// <div class="notice">
//     <b>Important Notice</b>
//     <ul>
//         <li>Warranty period one year less than 14 working days.</li>
//         <li>Warranty covers only manufacturer's defects. Damages or defects due to misuse, negligence, or power issues are not covered.</li>
//         <li>Repairs or replacements may include labor or material costs.</li>
//         <li>No warranty for cartridges, power adaptors, some battery types, and software.</li>
//     </ul>
// </div>

// <div class="signatures">
//     <div>
//         <hr>
//         <p>Authorized</p>
//     </div>
//     <div>
//         <hr>
//         <p>Customer Signature</p>
//     </div>
// </div>

// </body>
// </html>
// `;
  
//   }
//   const openPreview = () => {
//     const previewHTML = generatePreviewHTML();
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(previewHTML);
//     printWindow.document.close();
    
//     // Wait for content to load then trigger print
//     printWindow.onload = () => {
//       printWindow.focus();
//       printWindow.print();
//     };
//   };

//   const exportTemplatePDF = () => {
//     if (!invoice) return;

//     const pdf = new jsPDF({
//       orientation: 'portrait',
//       unit: 'mm',
//       format: 'a5'
//     });
    
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const margin = 15;
//     let yPosition = margin;

//     // Header with logo placeholder
//     pdf.setFontSize(24);
//     pdf.setFont(undefined, 'bold');
//     pdf.text('E - TECHCARE', margin, yPosition);
//     yPosition += 8;
    
//     pdf.setFontSize(9);
//     pdf.setFont(undefined, 'normal');
//     pdf.text('No.158, Wakwella Road, Galle', margin, yPosition);
//     yPosition += 4;
//     pdf.text('TEL: 076 795 7125 | EMAIL: etechcarelh@gmail.com', margin, yPosition);
//     yPosition += 4;
//     pdf.text('WHATSAPP: 076 795 7125', margin, yPosition);
//     yPosition += 8;

//     // Add logo placeholder box
//     pdf.rect(pageWidth - margin - 25, margin, 25, 25);
//     pdf.setFontSize(7);
//     pdf.text('Company Logo', pageWidth - margin - 12.5, margin + 12.5, { align: 'center' });

//     // Horizontal line
//     pdf.setDrawColor(0);
//     pdf.setLineWidth(0.5);
//     pdf.line(margin, yPosition, pageWidth - margin, yPosition);
//     yPosition += 10;

//     // Invoice Title
//     pdf.setFontSize(16);
//     pdf.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
//     yPosition += 10;

//     // Invoice Details Table
//     const jobNumber = invoice.jobCard?.jobNumber || 'N/A';
//     const details = [
//       [`DATE: ${new Date(invoice.createdAt).toLocaleDateString()}`, `USER: Admin`, `JOB NO: ${jobNumber}`],
//       [`INVOICE NO: ${invoice.invoiceNumber}`, `PMT METHOD: ${invoice.paymentMethod || 'Cash'}`, `CUSTOMER: ${invoice.customerName}`],
//       [`CONTACT NUMBER: ${invoice.customerPhone}`, '', '']
//     ];

//     pdf.setFontSize(8);
//     details.forEach(row => {
//       pdf.text(row[0], margin, yPosition);
//       pdf.text(row[1], pageWidth / 2, yPosition, { align: 'center' });
//       pdf.text(row[2], pageWidth - margin, yPosition, { align: 'right' });
//       yPosition += 4;
//     });
//     yPosition += 5;

//     // UPDATED: Items Table with Services and itemCode
//     const servicesData = (invoice.jobCard?.serviceCategories || []).map((service, index) => [
//       (index + 1).toString(),
//       'SERVICE',
//       service.name,
//       'Service',
//       '1',
//       `Rs.${(service.servicePrice || 0).toFixed(2)}`,
//       `Rs.${(service.servicePrice || 0).toFixed(2)}`
//     ]);

//     const itemsData = (invoice.items || []).map((item, index) => [
//       ((invoice.jobCard?.serviceCategories?.length || 0) + index + 1).toString(),
//       item.itemCode || item.sku || 'N/A',
//       item.itemName || 'Item',
//       item.warranty || 'No Warranty',
//       (item.quantity || 0).toString(),
//       `Rs.${(item.unitPrice || 0).toFixed(2)}`,
//       `Rs.${(item.total || 0).toFixed(2)}`
//     ]);

//     const combinedData = [...servicesData, ...itemsData];

//     pdf.autoTable({
//       startY: yPosition,
//       head: [['No', 'Item Code', 'Description', 'Warranty', 'QTY', 'Unit Price', 'Amount']],
//       body: combinedData,
//       styles: { 
//         fontSize: 7,
//         cellPadding: 2,
//         lineColor: [0, 0, 0],
//         lineWidth: 0.1
//       },
//       headStyles: { 
//         fillColor: [240, 240, 240],
//         textColor: [0, 0, 0],
//         fontStyle: 'bold'
//       },
//       margin: { left: margin, right: margin },
//       tableWidth: pageWidth - (margin * 2)
//     });

//     let finalY = pdf.lastAutoTable.finalY + 5;

//     // UPDATED: Totals with Services
//     const servicesTotal = (invoice.jobCard?.serviceCategories || [])
//       .reduce((sum, service) => sum + (service.servicePrice || 0), 0);
//     const itemsSubtotal = invoice.subtotal || 0;
//     const combinedSubtotal = servicesTotal + itemsSubtotal;

//     pdf.setFontSize(8);
//     pdf.setFont(undefined, 'bold');
//     pdf.text(`ITEMS SUBTOTAL: Rs.${itemsSubtotal.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
//     finalY += 4;
//     pdf.text(`SERVICES TOTAL: Rs.${servicesTotal.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
//     finalY += 4;
//     pdf.text(`COMBINED TOTAL: Rs.${combinedSubtotal.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
//     finalY += 4;
//     pdf.text(`DISCOUNT: Rs.${invoice.discount.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
//     finalY += 4;
//     pdf.text(`ADVANCE: Rs.${invoice.paidAmount.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
//     finalY += 4;
//     pdf.text(`SUB TOTAL: Rs.${invoice.total.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
//     finalY += 4;
//     pdf.text(`BALANCE: Rs.${invoice.balance.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
//     finalY += 10;

//     // Important Notice
//     pdf.setFont(undefined, 'normal');
//     pdf.setFontSize(7);
//     pdf.text('Important Notice:', margin, finalY);
//     finalY += 4;
//     pdf.text('- Warranty covers only manufacturer\'s defects. Damages due to misuse not covered.', margin, finalY);
//     finalY += 3;
//     pdf.text('- Repairs may include labor or material costs.', margin, finalY);
//     finalY += 3;
//     pdf.text('- No warranty for cartridges, adaptors, batteries, software.', margin, finalY);
//     finalY += 10;

//     // Signatures
//     const signatureY = finalY + 15;
//     pdf.line(margin + 10, signatureY, margin + 50, signatureY);
//     pdf.line(pageWidth - margin - 50, signatureY, pageWidth - margin - 10, signatureY);
//     pdf.text('Authorized', margin + 30, signatureY + 5, { align: 'center' });
//     pdf.text('Customer Signature', pageWidth - margin - 30, signatureY + 5, { align: 'center' });

//     pdf.save(`Invoice_${invoice.invoiceNumber}_A5.pdf`);
//   };

//   const exportPDF = () => {
//     if (!invoice) return;

//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.getWidth();
//     let yPosition = 20;

//     // Header
//     doc.setFontSize(20);
//     doc.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
//     yPosition += 15;

//     doc.setFontSize(10);
//     doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, yPosition);
//     yPosition += 6;
//     doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, yPosition);
//     yPosition += 12;

//     // Customer Info
//     doc.setFont(undefined, 'bold');
//     doc.text('Customer Information:', 20, yPosition);
//     doc.setFont(undefined, 'normal');
//     yPosition += 6;
//     doc.setFontSize(9);
//     doc.text(`Name: ${invoice.customerName}`, 20, yPosition);
//     yPosition += 5;
//     doc.text(`Phone: ${invoice.customerPhone}`, 20, yPosition);
//     yPosition += 5;
//     if (invoice.customerEmail) {
//       doc.text(`Email: ${invoice.customerEmail}`, 20, yPosition);
//       yPosition += 5;
//     }

//     // Job Card Info (if exists)
//     if (invoice.jobCard) {
//       yPosition += 3;
//       doc.setFont(undefined, 'bold');
//       doc.text('Job Card Details:', 20, yPosition);
//       doc.setFont(undefined, 'normal');
//       yPosition += 5;
//       doc.text(`Job Number: ${invoice.jobCard.jobNumber}`, 20, yPosition);
//       yPosition += 5;
//       if (invoice.jobCard.fault) {
//         doc.text(`Fault Type: ${invoice.jobCard.fault.faultName}`, 20, yPosition);
//         yPosition += 5;
//       }
//     }

//     yPosition += 5;

//     // Items Table with itemCode
//     const itemsData = (invoice.items || []).map(item => [
//       item.itemCode || item.sku || 'N/A',
//       item.itemName || 'Item',
//       item.quantity || 0,
//       `Rs.${(item.unitPrice || 0).toFixed(2)}`,
//       `Rs.${(item.total || 0).toFixed(2)}`
//     ]);

//     doc.autoTable({
//       startY: yPosition,
//       head: [['Item Code', 'Description', 'Qty', 'Rate', 'Total']],
//       body: itemsData,
//       margin: { left: 20, right: 20 }
//     });

//     // Totals
//     let finalY = doc.lastAutoTable.finalY + 10;

//     doc.setFontSize(10);
//     doc.text(`Subtotal: Rs.${invoice.subtotal.toFixed(2)}`, 20, finalY);
//     doc.text(`Discount: -Rs.${invoice.discount.toFixed(2)}`, 20, finalY + 6);
//     doc.text(`Tax: +Rs.${invoice.tax.toFixed(2)}`, 20, finalY + 12);
//     doc.setFont(undefined, 'bold');
//     doc.text(`Total: Rs.${invoice.total.toFixed(2)}`, 20, finalY + 20);
//     doc.setFont(undefined, 'normal');
//     doc.text(`Paid: Rs.${invoice.paidAmount.toFixed(2)}`, 20, finalY + 26);
//     doc.text(`Balance: Rs.${invoice.balance.toFixed(2)}`, 20, finalY + 32);

//     doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
//   };

//   const getPaymentStatusColor = (status) => {
//     const colors = {
//       PAID: 'bg-green-100 text-green-800 border-green-300',
//       PARTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-300',
//       UNPAID: 'bg-red-100 text-red-800 border-red-300'
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error || !invoice) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           {error || 'Invoice not found'}
//         </div>
//         <button
//           onClick={onClose}
//           className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
//         >
//           Back
//         </button>
//       </div>
//     );
//   }

//   // Get device serials only (DEVICE_SERIAL type)
//   const deviceSerials = invoice.jobCard?.serials?.filter(s => s.serialType === 'DEVICE_SERIAL') || [];

//   // Calculate total for used items
//   const usedItemsTotal = (invoice.jobCard?.usedItems || []).reduce((sum, item) => {
//     return sum + (item.quantityUsed * (item.unitPrice || 0));
//   }, 0);

//   // Calculate total services cost from job card
//   const jobCardServicesTotal = (invoice.jobCard?.serviceCategories || [])
//     .reduce((sum, service) => sum + (service.servicePrice || 0), 0);

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-3xl font-bold mb-2">{invoice.invoiceNumber}</h1>
//               <p className="text-blue-100">Invoice Details</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//           <div className="mt-4">
//             <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getPaymentStatusColor(invoice.paymentStatus)}`}>
//               {invoice.paymentStatus}
//             </span>
//           </div>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Customer Information */}
//           <div className="border-b border-gray-200 pb-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//               </svg>
//               Customer Information
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Customer Name</p>
//                 <p className="font-semibold text-gray-900">{invoice.customerName}</p>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Phone</p>
//                 <p className="font-semibold text-gray-900">{invoice.customerPhone}</p>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Email</p>
//                 <p className="font-semibold text-gray-900">{invoice.customerEmail || 'N/A'}</p>
//               </div>
//             </div>
//           </div>

//           {/* Job Card Information */}
//           {invoice.jobCard && (
//             <>
//               {/* Job Card Header */}
//               <div className="border-b border-gray-200 pb-6">
//                 <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                   <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                   </svg>
//                   Job Card Details
//                 </h2>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-green-50 p-4 rounded-lg border-2 border-green-300">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Job Number</p>
//                     <p className="font-bold text-lg text-green-700">{invoice.jobCard.jobNumber}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Device Type</p>
//                     <p className="font-semibold text-gray-900">{invoice.jobCard.deviceType}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">Status</p>
//                     <p className="font-semibold text-gray-900">{invoice.jobCard.status}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Fault Information */}
//               {invoice.jobCard.fault && (
//                 <div className="border-b border-gray-200 pb-6">
//                   <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                     <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     Fault Information
//                   </h2>
//                   <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
//                     <div className="mb-3">
//                       <p className="text-sm font-medium text-gray-600">Fault Type</p>
//                       <p className="font-bold text-lg text-red-700">{invoice.jobCard.fault.faultName}</p>
//                     </div>
//                     <div className="pt-3 border-t border-red-200">
//                       <p className="text-sm font-medium text-gray-600 mb-2">Fault Description</p>
//                       <p className="text-gray-900 whitespace-pre-wrap">{invoice.jobCard.faultDescription}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Device Serial (DEVICE_SERIAL only) */}
//               {deviceSerials.length > 0 && (
//                 <div className="border-b border-gray-200 pb-6">
//                   <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                     <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                     </svg>
//                     Device Serial
//                   </h2>
//                   <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg">
//                     <div className="space-y-2">
//                       {deviceSerials.map((serial, index) => (
//                         <div key={index} className="flex items-center justify-between bg-white p-3 rounded border-2 border-blue-400">
//                           <div className="flex items-center">
//                             <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded mr-3">DEVICE_SERIAL</span>
//                             <span className="text-gray-700 font-semibold text-lg">{serial.serialValue}</span>
//                           </div>
//                           <span className="text-blue-600 text-sm font-medium">🔹 Primary</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Used Items / Parts - WITH WARRANTY */}
//               {invoice.jobCard.usedItems && invoice.jobCard.usedItems.length > 0 && (
//                 <div className="border-b border-gray-200 pb-6">
//                   <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                     <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10M8 15h8" />
//                     </svg>
//                     Used Items / Parts
//                   </h2>
//                   <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
//                     <div className="overflow-x-auto">
//                       <table className="w-full text-sm">
//                         <thead>
//                           <tr className="border-b-2 border-green-300">
//                             <th className="text-left py-3 px-2 font-semibold text-gray-900">Item Code</th>
//                             <th className="text-left py-3 px-2 font-semibold text-gray-900">Item Name</th>
//                             <th className="text-center py-3 px-2 font-semibold text-gray-900">Qty</th>
//                             <th className="text-right py-3 px-2 font-semibold text-gray-900">Unit Price</th>
//                             <th className="text-right py-3 px-2 font-semibold text-gray-900">Total</th>
//                             <th className="text-left py-3 px-2 font-semibold text-gray-900">Warranty</th>
//                             <th className="text-center py-3 px-2 font-semibold text-gray-900">Warranty #</th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-green-200">
//                           {invoice.jobCard.usedItems.map((item, index) => {
//                             const itemTotal = (item.quantityUsed || 0) * (item.unitPrice || 0);
//                             return (
//                               <tr key={index} className="hover:bg-green-100 transition-colors">
//                                 <td className="py-3 px-2">
//                                   <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
//                                     {item.inventoryItem?.sku || 'N/A'}
//                                   </span>
//                                 </td>
//                                 <td className="py-3 px-2">
//                                   <div>
//                                     <p className="font-semibold text-gray-900">
//                                       {item.inventoryItem?.name || 'Unknown Item'}
//                                     </p>
//                                   </div>
//                                 </td>
//                                 <td className="text-center py-3 px-2">
//                                   <span className="bg-green-200 text-green-800 px-3 py-1 rounded font-semibold">
//                                     {item.quantityUsed}
//                                   </span>
//                                 </td>
//                                 <td className="text-right py-3 px-2">
//                                   <span className="font-semibold text-gray-900">
//                                     Rs.{(item.unitPrice || 0).toFixed(2)}
//                                   </span>
//                                 </td>
//                                 <td className="text-right py-3 px-2">
//                                   <span className="font-bold text-green-700">
//                                     Rs.{itemTotal.toFixed(2)}
//                                   </span>
//                                 </td>
//                                 <td className="text-left py-3 px-2">
//                                   {item.warranty ? (
//                                     <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
//                                       {item.warranty}
//                                     </span>
//                                   ) : (
//                                     <span className="text-gray-500 text-xs">None</span>
//                                   )}
//                                 </td>
//                                 <td className="text-center py-3 px-2">
//                                   {item.warrantyNumber ? (
//                                     <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono font-bold">
//                                       {item.warrantyNumber}
//                                     </span>
//                                   ) : (
//                                     <span className="text-gray-400 text-xs">-</span>
//                                   )}
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>

//                     {/* Total Parts Cost */}
//                     <div className="mt-4 border-t-2 border-green-300 pt-4 flex justify-end">
//                       <div className="bg-green-100 px-6 py-3 rounded-lg border-2 border-green-400">
//                         <div className="flex items-center justify-between gap-8">
//                           <span className="text-lg font-semibold text-gray-900">Total Parts Cost:</span>
//                           <span className="text-2xl font-bold text-green-700">
//                             Rs.{usedItemsTotal.toFixed(2)}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Job Card Services Section - NEW */}
//               {invoice.jobCard?.serviceCategories && invoice.jobCard.serviceCategories.length > 0 && (
//                 <div className="border-b border-gray-200 pb-6">
//                   <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                     <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     Services Performed
//                   </h2>
//                   <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
//                     <div className="overflow-x-auto">
//                       <table className="w-full text-sm">
//                         <thead>
//                           <tr className="border-b-2 border-purple-300">
//                             <th className="text-left py-3 px-2 font-semibold text-gray-900">Service Name</th>
//                             <th className="text-left py-3 px-2 font-semibold text-gray-900">Service Code</th>
//                             <th className="text-left py-3 px-2 font-semibold text-gray-900">Description</th>
//                             <th className="text-right py-3 px-2 font-semibold text-gray-900">Price</th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-purple-200">
//                           {invoice.jobCard.serviceCategories.map((service, index) => (
//                             <tr key={index} className="hover:bg-purple-100 transition-colors">
//                               <td className="py-3 px-2">
//                                 <span className="font-semibold text-gray-900">{service.name}</span>
//                               </td>
//                               <td className="py-3 px-2">
//                                 <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-xs font-medium">
//                                   {service.code}
//                                 </span>
//                               </td>
//                               <td className="py-3 px-2 text-gray-600">
//                                 {service.description || 'N/A'}
//                               </td>
//                               <td className="text-right py-3 px-2">
//                                 <span className="font-bold text-purple-700">
//                                   Rs.{(service.servicePrice || 0).toFixed(2)}
//                                 </span>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>

//                     {/* Total Services Cost */}
//                     <div className="mt-4 border-t-2 border-purple-300 pt-4 flex justify-end">
//                       <div className="bg-purple-100 px-6 py-3 rounded-lg border-2 border-purple-400">
//                         <div className="flex items-center justify-between gap-8">
//                           <span className="text-lg font-semibold text-gray-900">Total Services Cost:</span>
//                           <span className="text-2xl font-bold text-purple-700">
//                             Rs.{jobCardServicesTotal.toFixed(2)}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}

//           {/* Services Section - ADDED */}
//           {invoice.items && invoice.items.filter(item => item.itemType === 'SERVICE').length > 0 && (
//             <div className="border-b border-gray-200 pb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 Services Provided
//               </h2>
//               <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="border-b-2 border-purple-300">
//                         <th className="text-left py-3 px-2 font-semibold text-gray-900">Service Name</th>
//                         <th className="text-center py-3 px-2 font-semibold text-gray-900">Qty</th>
//                         <th className="text-right py-3 px-2 font-semibold text-gray-900">Price</th>
//                         <th className="text-right py-3 px-2 font-semibold text-gray-900">Total</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-purple-200">
//                       {invoice.items
//                         .filter(item => item.itemType === 'SERVICE')
//                         .map((item, idx) => (
//                           <tr key={idx} className="hover:bg-purple-100 transition-colors">
//                             <td className="px-2 py-3 text-gray-900 font-medium">{item.itemName}</td>
//                             <td className="text-center py-3 px-2 font-semibold">
//                               <span className="bg-purple-200 text-purple-800 px-3 py-1 rounded">
//                                 {item.quantity}
//                               </span>
//                             </td>
//                             <td className="text-right py-3 px-2 font-semibold text-gray-900">
//                               Rs.{(item.unitPrice || 0).toFixed(2)}
//                             </td>
//                             <td className="text-right py-3 px-2 font-bold text-purple-700">
//                               Rs.{(item.total || 0).toFixed(2)}
//                             </td>
//                           </tr>
//                         ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Services Total */}
//                 <div className="mt-4 border-t-2 border-purple-300 pt-4 flex justify-end">
//                   <div className="bg-purple-100 px-6 py-3 rounded-lg border-2 border-purple-400">
//                     <div className="flex items-center justify-between gap-8">
//                       <span className="text-lg font-semibold text-gray-900">Total Services:</span>
//                       <span className="text-2xl font-bold text-purple-700">
//                         Rs.{invoice.items
//                           .filter(item => item.itemType === 'SERVICE')
//                           .reduce((sum, item) => sum + (item.total || 0), 0)
//                           .toFixed(2)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Parts Section - ADDED */}
//           {invoice.items && invoice.items.filter(item => item.itemType === 'PART').length > 0 && (
//             <div className="border-b border-gray-200 pb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
//                 </svg>
//                 Parts/Items Used
//               </h2>
//               <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="border-b-2 border-green-300">
//                         <th className="text-left py-3 px-2 font-semibold text-gray-900">Item Code</th>
//                         <th className="text-left py-3 px-2 font-semibold text-gray-900">Item Name</th>
//                         <th className="text-center py-3 px-2 font-semibold text-gray-900">Qty</th>
//                         <th className="text-right py-3 px-2 font-semibold text-gray-900">Price</th>
//                         <th className="text-center py-3 px-2 font-semibold text-gray-900">Warranty</th>
//                         <th className="text-center py-3 px-2 font-semibold text-gray-900">Warranty #</th>
//                         <th className="text-right py-3 px-2 font-semibold text-gray-900">Total</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-green-200">
//                       {invoice.items
//                         .filter(item => item.itemType === 'PART')
//                         .map((item, idx) => (
//                           <tr key={idx} className="hover:bg-green-100 transition-colors">
//                             <td className="px-2 py-3">
//                               <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
//                                 {item.itemCode || item.sku || 'N/A'}
//                               </span>
//                             </td>
//                             <td className="px-2 py-3 text-gray-900 font-medium">{item.itemName}</td>
//                             <td className="text-center py-3 px-2 font-semibold">
//                               <span className="bg-green-200 text-green-800 px-3 py-1 rounded">
//                                 {item.quantity}
//                               </span>
//                             </td>
//                             <td className="text-right py-3 px-2 font-semibold text-gray-900">
//                               Rs.{(item.unitPrice || 0).toFixed(2)}
//                             </td>
//                             <td className="text-center py-3 px-2">
//                               {item.warranty && item.warranty !== 'No Warranty' ? (
//                                 <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
//                                   {item.warranty}
//                                 </span>
//                               ) : (
//                                 <span className="text-gray-500 text-xs">None</span>
//                               )}
//                             </td>
//                             <td className="text-center py-3 px-2">
//                               {item.warrantyNumber ? (
//                                 <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono font-bold">
//                                   {item.warrantyNumber}
//                                 </span>
//                               ) : (
//                                 <span className="text-gray-400 text-xs">-</span>
//                               )}
//                             </td>
//                             <td className="text-right py-3 px-2 font-bold text-green-700">
//                               Rs.{(item.total || 0).toFixed(2)}
//                             </td>
//                           </tr>
//                         ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Parts Total */}
//                 <div className="mt-4 border-t-2 border-green-300 pt-4 flex justify-end">
//                   <div className="bg-green-100 px-6 py-3 rounded-lg border-2 border-green-400">
//                     <div className="flex items-center justify-between gap-8">
//                       <span className="text-lg font-semibold text-gray-900">Total Parts:</span>
//                       <span className="text-2xl font-bold text-green-700">
//                         Rs.{invoice.items
//                           .filter(item => item.itemType === 'PART')
//                           .reduce((sum, item) => sum + (item.total || 0), 0)
//                           .toFixed(2)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Invoice Items Table - MAIN ITEMS */}
//           <div className="border-b border-gray-200 pb-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//               <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               Invoice Items
//             </h2>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm border border-gray-200">
//                 <thead className="bg-gray-50 border-b-2 border-gray-200">
//                   <tr>
//                     <th className="px-4 py-3 text-left font-semibold text-gray-900">Item Code</th>
//                     <th className="px-4 py-3 text-left font-semibold text-gray-900">Description</th>
//                     <th className="px-4 py-3 text-center font-semibold text-gray-900">Qty</th>
//                     <th className="px-4 py-3 text-right font-semibold text-gray-900">Rate</th>
//                     <th className="px-4 py-3 text-center font-semibold text-gray-900">Warranty</th>
//                     <th className="px-4 py-3 text-center font-semibold text-gray-900">Warranty #</th>
//                     <th className="px-4 py-3 text-right font-semibold text-gray-900">Total</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {invoice.items && invoice.items.length > 0 ? (
//                     invoice.items.map((item, idx) => (
//                       <tr key={idx} className="hover:bg-gray-50 transition-colors">
//                         {/* ✅ NEW: Item Code Column */}
//                         <td className="px-4 py-3 font-semibold text-gray-900">
//                           <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
//                             {item.itemCode || item.sku || 'N/A'}
//                           </span>
//                         </td>
                        
//                         <td className="px-4 py-3">
//                           <div>
//                             <p className="font-medium text-gray-900">{item.itemName || 'Item'}</p>
//                             {item.serialNumbers && item.serialNumbers.length > 0 && (
//                               <div className="text-xs text-gray-600 mt-1">
//                                 <span className="font-medium">Serials: </span>
//                                 <span>{item.serialNumbers.join(', ')}</span>
//                               </div>
//                             )}
//                           </div>
//                         </td>
                        
//                         <td className="px-4 py-3 text-center font-semibold text-gray-900">
//                           {item.quantity || 0}
//                         </td>
                        
//                         <td className="px-4 py-3 text-right font-semibold text-gray-900">
//                           Rs.{(item.unitPrice || 0).toFixed(2)}
//                         </td>
                        
//                         <td className="px-4 py-3 text-center">
//                           {item.warranty && item.warranty !== 'No Warranty' ? (
//                             <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
//                               {item.warranty}
//                             </span>
//                           ) : (
//                             <span className="text-gray-500 text-xs">None</span>
//                           )}
//                         </td>
                        
//                         {/* ✅ NEW: Warranty Number Column */}
//                         <td className="px-4 py-3 text-center">
//                           {item.warrantyNumber ? (
//                             <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono font-bold">
//                               {item.warrantyNumber}
//                             </span>
//                           ) : (
//                             <span className="text-gray-400 text-xs">-</span>
//                           )}
//                         </td>
                        
//                         <td className="px-4 py-3 text-right font-bold text-blue-600">
//                           Rs.{(item.total || 0).toFixed(2)}
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
//                         No items in invoice
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Totals Summary */}
//           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
//             <div className="space-y-3">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-600">Subtotal:</span>
//                 <span className="font-semibold text-gray-900">Rs.{invoice.subtotal.toFixed(2)}</span>
//               </div>
//               {invoice.discount > 0 && (
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Discount:</span>
//                   <span className="font-semibold text-red-600">-Rs.{invoice.discount.toFixed(2)}</span>
//                 </div>
//               )}
//               {invoice.tax > 0 && (
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Tax:</span>
//                   <span className="font-semibold text-gray-900">+Rs.{invoice.tax.toFixed(2)}</span>
//                 </div>
//               )}
//               <div className="border-t-2 border-blue-300 pt-3 flex justify-between">
//                 <span className="font-semibold text-gray-900">Total Amount:</span>
//                 <span className="text-2xl font-bold text-blue-600">Rs.{invoice.total.toFixed(2)}</span>
//               </div>
//             </div>
//           </div>

//           {/* Payment Info */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="bg-green-50 p-4 rounded-lg border border-green-200">
//               <p className="text-sm text-green-600 font-medium mb-1">Amount Paid</p>
//               <p className="text-2xl font-bold text-green-700">Rs.{invoice.paidAmount.toFixed(2)}</p>
//             </div>
//             <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
//               <p className="text-sm text-yellow-600 font-medium mb-1">Balance Due</p>
//               <p className="text-2xl font-bold text-yellow-700">Rs.{invoice.balance.toFixed(2)}</p>
//             </div>
//             <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//               <p className="text-sm text-blue-600 font-medium mb-1">Payment Method</p>
//               <p className="text-lg font-bold text-blue-700">{invoice.paymentMethod || 'Not Set'}</p>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-gray-200">
//             <button
//               onClick={onClose}
//               className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
//             >
//               Close
//             </button>
//             <button
//               onClick={() => window.print()}
//               className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
//             >
//               Print
//             </button>
//             <button
//               onClick={openPreview}
//               className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               <span>Preview A5 Template</span>
//             </button>
//             <button
//               onClick={exportTemplatePDF}
//               className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               <span>Download A5 PDF</span>
//             </button>
//             {invoice.paymentStatus !== 'PAID' && (
//               <button
//                 onClick={() => setShowPaymentModal(true)}
//                 className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
//               >
//                 Add Payment
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Payment Modal */}
//       {showPaymentModal && (
//         <PaymentModal
//           invoice={invoice}
//           onSuccess={handlePaymentSuccess}
//           onClose={() => setShowPaymentModal(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default InvoiceView;


















import { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import PaymentModal from './PaymentModal';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// ✅ REPLACE THIS WITH YOUR ACTUAL BASE64 IMAGE STRING
// Example format: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
 const COMPANY_LOGO_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAQDAwQDAwQEAwQFBAQFBgoHBgYGBg0JCggKDw0QEA8NDw4RExgUERIXEg4PFRwVFxkZGxsbEBQdHx0aHxgaGxr/2wBDAQQFBQYFBgwHBwwaEQ8RGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhr/wAARCABlAKoDASIAAhEBAxEB/8QAHQAAAgIDAQEBAAAAAAAAAAAAAAgGBwMEBQECCf/EAEsQAAEDAwMABQYHDQYGAwAAAAIBAwQABQYHERIUISIxMggTQUJRchVSYWKBgpIWIyQzVXGRk5ShsbLRFxglN1aiQ0RTY4TCdJXh/8QAGgEAAwEBAQEAAAAAAAAAAAAAAAQFAwIGAf/EADgRAAEDAgIHBAkCBwAAAAAAAAIAAQMEEgURExQhIjFBUTJSkZIVQmFicXKBoeGxwSMkM0NTorL/2gAMAwEAAhEDEQA/AH4f8Ce9WvWw/wCBPerXoQiiihEIvDQhFFe8SH1a8oQiiiihCKKKKEIooooQiiiihCKKEHl4aFQh8VCEUUUUIRRRRQhFFFFCFme8KfnqN5Vl9mwu2LcMjmtw46dQIvWbhewB9ZakbyKgjsvVvS32zRe+ZTlNyv2s01Z0OI4axYrLu4OAm6+H0Bt6tM08cUlxSlazeL/BIVc00YsMIXO/g3xWOVrbm+oEk42k2MuNRELbp8kBL6eRdhP91fK6VatXpPP5Hn6W0V6+DT58R+zxGpHqBlGZWJ+04xpjjbMfpkfzjTzSIfmQ7u7wh7y1HWPJ3y/KF6Zn+Zvq8fWTLJKe31i7P+2q4HGA5taDeYlAkjllMgK+R/jYC+R0g1HjH5ywam9LeT1ClH/Uq+2801j09fbDLrIGSW8jEPPMiKl1rt4x7vrDWZ7yUkjp5yyZfcI0ke0hOJ1b/V2rkSrnqroyPLJEHLMY8DpqSnxD8/eH8tdicc+wSE/Y42l9Fk8ctNvkJx+1nvb6imOtNzcntD0mGcKTwEzZMkLjv84e+uivUlUTk+b3LJNNgu+jKvuS3JAhNAO3JYTbw8Sqc6SZRNyfDozt/P8AxuIpMXFow4GDqe0fbUeWnKOPSe3LLmvRxVgSy6MemefJ1XGrOP6r3DMX38Ekz2bOrACAszRaHnt19neqYvuQ6pY3fWbJeL9do1ze4cGencuXPu7W9PWi70omuv8AnrZ//E/mqrh1RpS0LgOwei8/i9HoR04GWbl13dqzQMT12GfEKVMuvmBdBXeVyHw8uv1qjK5FqTlOc3Wx4xf7k5JbkPebZ6aoCIAtO5STYHldqwzWq8XXIX1jQhflgRoHPtKXZ6q0pKh6gTewcxHZurOupBpCiDSlaRb2ZKQfcXr16bjcP/tauXPtUh0tw61/CidMyJ+KAAwp78nUFOZmXs3rxvyiMAdMBbuj25kgp+ClVC5iS6n6/M2yQalC6U1FAfY0g8i/mrgAOpk/mQtEd7s5LWSSKiiLVJbzMhbjnkssD+2XVkVuEGZNYt7i9gkk9EZ+oieKpThmK6v4tmFoZu0+Y9ZnHdpRpL6Q3wEevcS8NMzEiNW+M1GhtgxHZBAbAE4oIp6Kyu/ij90qUPESJnBgHL4J+PCBDIzlIj+ZLFoZmeQ33VW8QLveZ06E03LIGH31MB4u7J2aZ+kg0pze04FqdebpkJvNxV6WyJNhzXkrvxfq1f395vAfTIn/ALJ/+1viNJKc+cYbMvVS+E10AU+U0u9mXadV7ptmeQ3LX242m4XmbJtgSpwjFceVW0EOfHq+SmkTupNdFp7N18oJ+4Q1Uo0x64OtEQ7LwJDVKcr0VhiYDHKIiPIU1gshS05kT3b5IoooqSryzveBOrbrrAo8k2Xw1neXsJ+eoPnmpdh05ZhOZE86KzDIGgZDmS7eJfzJySuwEjLIG2rOSQIgvMsmUoiQI0JSWKyDRF4lStwXlTvXeq0TXvT4kRfuhZ+wVH9vWnv+oGfsFW2q1HcLypZq2jb+63iytETQ06lT9FY5EZqYy4xKbF1lwdjAh3Qkqsv7etPf9Qs/YWvodftP078iZ/VrXzVajuF4I1yl/wAo+KqW9QHNANVIFztKmGJ30/Nvscuppd+tPq8t0+SrSuXDEtSrXdoi7WvKA6LL28PSBHk0f0p2ag2sme4bqXhzlmx66Nzr2bwFAZAF5G5y22GpJf4893ReKd2aJm+WJuPJcBe8DaUf/WqZs5iDybCfdL9nUOKyI5WifMB32y5dWVx0omuv+etn/wDE/npsLZMGfbocsPDIYBz7Q8qVDXRoy10s5CBkn4J2kH51Z4Xu1BfKSZxzepRy7wput6SXBsRtmb603i039snYRvyzJAMgXkJdXXTtbUh9szKZp7qner3Dt/TnQlSm/NmJChciX2VrhgmQStHxtWGNOAnTvJwu2plm/JuwBpwDGBK5ASKP4UdUQ46GFeUejlx+9RwuidZegDFBFakn962+Ii7YtH+0ddjVbTudqli1kzewxBbvbkQTkwwL8aHyfOSmomqITtqy3T3e0kah6WqjvoR3gJi4ZJlE7urtV8u/ij91aT7FfKMybCogWjKLWtxSMnmwJ/dp4UH0L8apljHlG3nMcttVrhWEI1ukP8JBoJOmIr6eXhSpp4ZUhmXJV48ao5bRu2vyyVaaTYZac81QvVsyJk34Y9LeEQNQXkjvxk96mB/u16f/AJOlftR1UHk8NG3rHfCMDFPNTO0Q/wDdpu6bxOpninyA3ZrWSeD0lPPT3yALvcSTfReAzavKBkQIYkMaI7cGWkUuWwCholORSg6UtGPlI3IibMR6VcutUXb16b5awxV7px+UUxgTW05t75fsiiiio69Esrqfe03276rzUjC8ezVuIzk0J+V8HiUgTYPgrbfp3+QuPh+bXP8AKGut+s2nD8nFDdZd6U2kl5nxtx9i5Ens7XBPpqOeTzJu2W4S/Iyx1+Y23KNmG+6fbda2HkhF6U58qeihMIdaEuy/1UqaoCWo1IguzbP2LXSy6E7J1Wj9adfXwLoT7LR+sOrm+AbT+S4X7KH9KPgG1fkuF+yh/SvutP3j8y51H3A8v5VM/AuhPstH6w6PgXQn2Wj9YdXN8A2r8lwv2UP6UfANq/JcL9lD+lGtP3j8yNR9wPL+VT8a36IwZLMmE5a2JLJobToOmigXtSu3kef4U9il9hs5DFkPS4TopycUjM+C7VYvwHaeW3wXB3/+OH9KPgK1fkuD+yh/SuSmAiZyuf6rsaWUBdgsHP3fyuRpy+r+B466aEpFBa7/AHa8vmW4fZ5P+PXO1MSR/wCsQKaVUnlAarSsVbj4nihdHuUhtFfdZHrZAu4A+cVRfDvJflXyE3cs1ursORJHn0dtObg7/HIvTTIUsej0852C/DqkZK+Vj1WlC9w4vyTFWfO8ayB7zNmvkGY98QHh5L9FdU7dbxQ3HocT2masj+nuqjrB5MsLGcvtN5gXlyRGhPedNh5rYy27uJDU/wBZ8m+5bTm8zBXi+810dj3z7NLFFEUohAV1yejnnGE5KoGG1de2XvD73L6HapFoly+Kr5pkQIurxeipKAA02IgiAA+FEHiKV+feml3ewvN8cvDwEyw66gkS+u0S8Cp/5hIUJ8hXkhMEqL9Fa19JqpiLFczrHC6/X4idxtcVErvk2AG+Xw1cbG68Hi88QGSV1MeuWLTN0xd+1GXrDF4b/upNNItNIGpmVXe33SU7DbjgbwmyiKpFz29au1qjpJM0aO33/Gbw+4wb4tofHg42feO/HxJ2afOggE9BpXv/ANVMDFKoota0I2fNvJtp92x/HHQW5yYFsdeFfNk4oNkftrWXP8V/1Bbf2gaVHXDJHcxxbTq8ywTpEmDIR/iProYCS/u3qY2ryUYVwtcGWuRPCsmOD3Doo9nkiLt3/LS+pwRxCc52uWf2THpKqlmKOliYhHLnlxZMXZ59ju6uybE9BmGBcTejcSJCX2kNdeq70m0sZ0sg3GLHuBzknPg6qk1w4bJtViVLlYGMmB82V6ncyiF5BydFFFFZLdYrvAZultlwJQ8o8tk2XU9qGKov8aXjyfry/iF8yHTe/F5uZCkm7CQ/+IPrIn5+o/rUyT23EdvbVJa2aYTr8cTLMJJWMqtfEx832VfAf4mn707NPUpgQlDJwL7OpNdHILhURtmQcurc1c9FU9pnrxaMrYbtuTON2TJGvvbrL/YB0/aCl/Dvq4UJCQVEkIS9ZKWliOErDFOwVEVUF8ZXLzf6K8ccBpszdNAAE3VVLZESolqTdcjs+JypeEwBuN2AwQGeHPsb9pdvTVI3Swat53CUs+u0TEMd47yEU0a7HyoK7/QpDW0FPpRvc2Fvv4JaprdCVgA5P9vFTS16t2u/XLI3rcw+MSxKbrt0M/vJAgrsCJ8perWbQDIclyqxXK75VMWXFflkkDm2iEgj4voqnWoLecSIunWlLTzeMx3Rcu11MeJSS9Y1X2fFSmzsNjh43aIVqtjYtRIjSNAP5vTTlWMUEdjDvF5hb8qdQHPUy6Ry3Rz4cCd/1ZkpEdhMq8pkwuX3xoLoXZX4rQ9lKcmkvzd5zTPX5bxIBUiFLGWJe1o/FTjW25RLvBYnW10JEV8ENpwC3EhWusSbMYjbhajBiETmB+3eS2vRSxeVZkBy5NgxeGvJ0y6Q6A+1eyFM7399JLkcCbrPrVcoVofBhOZNtPHy2baa9bs/OrjCwbTvIfANq0xyQtXGEOJlapPrpgLOP6d4ZJhKHnrW0MaQod/b69/t1e+meSDlemVuuKnu90JWX/fBNv6VQl48mXKYlrmSDyRmeMdonPMeceLnt2tuvqrr+S1kqlaslx98+toFlsgvo6uJ/wDrTlQEctHcB3uBf9KbSSHT19pxWMY5eVVvo7qLbdNMqvFwvTMh9mQ0bIIwKEvLnvXb1L1Sm62zLVjOJ2p1mOUjmAOkPN49ur3UTtV9eTrjdoybN79GyC3sXFhqOZgDw8kQvO99bGv+DQ9Nsksl9w9pbazKIi4NEuzTwdrdPZuP8tUHeAq7K3fy2d1SgGqHDbs/4d21vW7S1te8X+47H9PbEpoZxIUhHTT0mqgRf7lrrW3ypbxb7dDhN41GNIzAMofnz69hRN/D8la3lIXscjten92bIfwy3m6XH2lw3/fvTOY1aYBY3ZiWDGI1gMKu7Adf3tPkpGWUApYnnC5979VSgglkrZmpZbGZh5Z8lwNINQ5epOOSbpPt7dvcZlkwLYGq7oKCu/X71WF3p11iYjsxQ4RmW2A79mwQU/dWWvPSOJmTg1rL10IGACJvc/VFFFFcLZbD/gT3q162H/AnvVr0IVcZ9ori2oClJnxFg3Nf+di7Car88e4/41Wrek2rWFl5vB8xbnQE8DMk9th90xJP0LTIIm3eu9e03HWTxDZ2m6PtU2XDqeU9J2S6tsS5DZPKDmjwcvFviD8dCZT+ArXjPk9ZVlMltzU/NHZjAlusaMZH/HZB+yVMdRW2vyt2BEflFY+ioC/qER/MS4WKYjZ8MtYW7HYQRIyd+ybmZfGNfStd2iip7uRvm6rAAgNoNkyrzVfSmBqbaW23HEh3SNusWVx34/IvtSl4i6fazadOORsaScsTl2egPg80Xy8C7vs05VeKPsp6CulgDR5MQ+1SqrDIao9Nm4H1ZKhaca1yulxaulzWW4kUTJtiZMBkTUh224D6feqZeT9pTfcKud5u2XQxizHwRtlPOgaqKrua9lav3rr3rruTEDkAgYRFn6LiLCYopRkcyJ26kvkxEwIDTkhDsqUsmLaSZfhurEq52y2i7j7zzwecSQH4lxF9Xfl2SWmdrzftbfJS8FQcIkzesnKijjqSAj4htS6aA6a5PhmYXmfklsWDFkRzBo1dA9y57+qvsqb6+YHPzvCwjWFjpFziSgeab5CPMe4k5L80qtWiuzrJTqGn9ZllHh0QUr0vJ0neQaT6gXvD8UtbmPuFLs/Smi3kteAyFQ9b8/6K+mMN13jsttMvXYG2hEGwGezxER7k8VOD1e399e016UkttcBSPoSHPNjNuHPp9FTOh9p1Dtku8rqU7McZNtronSZAO9e5ctuP1auVdvTQooq9adde7VOml0x3uOXwVimganiaNnd/iiiiisUyth/wJ71a9FFCEUUUUIRRRRQhFFFFCEUUUUIRRRRQhFFFFCEUUUUIRRRRQhFFFFCEUUUUIX//2Q==';

const InvoiceView = ({ invoiceId, onClose, onRefresh }) => {
  const { apiCall } = useApi();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const data = await apiCall(`/api/invoices/${invoiceId}`);
        setInvoice(data);
      } catch (err) {
        setError('Failed to load invoice');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handlePaymentSuccess = (response) => {
    setInvoice(response);
    setShowPaymentModal(false);
    if (onRefresh) onRefresh();
  };

  const generatePreviewHTML = () => {
    if (!invoice) return '';

    const jobNumber = invoice.jobCard?.jobNumber || 'N/A';
    const paymentMethod = invoice.paymentMethod || 'Cash';
    
    // Calculate service total
    const servicesTotal = (invoice.jobCard?.serviceCategories || [])
      .reduce((sum, service) => sum + (service.servicePrice || 0), 0);
    
    // Calculate invoice items total
    const invoiceItemsTotal = (invoice.items || [])
      .reduce((sum, item) => sum + (item.total || 0), 0);
    
    // TOTAL = Service Total + Invoice Items Total ONLY
    const calculatedTotal = servicesTotal + invoiceItemsTotal;
    
    // Generate services HTML from job card
    const servicesHTML = (invoice.jobCard?.serviceCategories || []).map((service, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>SERVICE</td>
        <td>${service.name} ${service.description ? `(${service.description})` : ''}</td>
        <td>Service</td>
        <td>-</td>
        <td>1</td>
        <td>${(service.servicePrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>${(service.servicePrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `).join('');
    
    // ✅ Generate parts HTML with itemCode, warranty AND warrantyNumber
    const itemsHTML = (invoice.items || []).map((item, index) => `
      <tr>
        <td>${(invoice.jobCard?.serviceCategories?.length || 0) + index + 1}</td>
        <td>${item.itemCode || item.sku || 'N/A'}</td>
        <td>${item.itemName || 'Item'}</td>
        <td>${item.warranty || 'No Warranty'}</td>
        <td>${item.warrantyNumber || '-'}</td>
        <td>${item.quantity || 0}</td>
        <td>${(item.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>${(item.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    const advanceAmount = invoice.paymentStatus === 'PAID' ? 0 : invoice.paidAmount;
    const subTotal = calculatedTotal - (invoice.discount || 0) - advanceAmount;
    const balance = invoice.paymentStatus === 'PAID' ? 0 : invoice.balance;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>E-TechCare Invoice (A5)</title>
<style>
    @page {
        size: A5;
        margin: 10mm;
    }
    body {
        font-family: Arial, sans-serif;
        font-size: 10px;
        margin: 0;
        padding: 0;
        color: #000;
        line-height: 1.3;
    }

    /* HEADER */
    .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 8px;
        margin-bottom: 10px;
        border-bottom: 3px solid #000;
    }
    .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .logo {
        width: 80px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3px;
        background-color: #fff;
    }
    .logo img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    .company-info h1 {
        font-size: 24px;
        margin: 0;
        font-weight: 900;
        letter-spacing: 2px;
        color: #111;
    }
    .company-details {
        text-align: right;
        line-height: 1.5;
        font-size: 9px;
    }
    .company-details p {
        margin: 2px 0;
    }

    /* TITLE */
    h2 {
        text-align: center;
        margin: 8px 0;
        font-size: 18px;
        letter-spacing: 1px;
        border-top: 2px solid #000;
        border-bottom: 2px solid #000;
        padding: 6px 0;
        background-color: #f5f5f5;
        font-weight: bold;
    }

    /* INVOICE DETAILS - List Style */
    .invoice-details {
        margin-bottom: 10px;
        font-size: 9px;
        line-height: 1.6;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3px 15px;
    }
    .invoice-details p {
        margin: 0;
    }
    .invoice-details .full-width {
        grid-column: 1 / -1;
    }
    .invoice-details b {
        display: inline-block;
        min-width: 110px;
    }

    /* ITEM TABLE */
    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 9px;
    }
    th, td {
        border: 1px solid #000;
        padding: 4px 3px;
        text-align: center;
    }
    th {
        background-color: #e8e8e8;
        font-weight: bold;
        font-size: 9px;
    }
    td {
        font-size: 9px;
    }

    /* TOTAL SECTION */
    .totals {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
        font-size: 10px;
    }
    .totals td {
        padding: 4px;
        text-align: right;
        border: none;
    }
    .totals .label {
        width: 80%;
        text-align: right;
        font-weight: bold;
    }
    .totals .value {
        width: 20%;
        border-bottom: 1px solid #000;
    }
    .totals .highlight {
        font-weight: bold;
        border-top: 2px solid #000;
        padding-top: 6px;
    }

    /* NOTICE */
    .notice {
        margin-top: 15px;
        font-size: 8px;
        line-height: 1.4;
    }
    .notice b {
        display: block;
        margin-bottom: 3px;
        font-size: 9px;
    }
    ul {
        margin-top: 0;
        padding-left: 15px;
    }
    ul li {
        margin-bottom: 2px;
    }

    /* SIGNATURES */
    .signatures {
        margin-top: 25px;
        display: flex;
        justify-content: space-between;
        font-size: 9px;
    }
    .signatures div {
        width: 45%;
        text-align: center;
    }
    .signatures hr {
        border: none;
        border-top: 1px solid #000;
        margin-bottom: 3px;
    }
</style>
</head>
<body>

<div class="header">
    <div class="header-left">
        <div class="logo">
            <img src="${COMPANY_LOGO_BASE64}" alt="E-TechCare Logo">
        </div>
        <div class="company-info">
            <h1>E-TECHCARE</h1>
        </div>
    </div>
    <div class="company-details">
        <p><b>ADDRESS:</b> No.158, Wakwella Road, Galle</p>
        <p><b>TEL:</b> 076 795 7125</p>
        <p><b>EMAIL:</b> etechcarelh@gmail.com</p>
        <p><b>WHATSAPP:</b> 076 795 7125</p>
    </div>
</div>

<h2>INVOICE</h2>

<div class="invoice-details">
    <p><b>DATE:</b> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
    <p><b>USER:</b> Admin</p>
    <p><b>INVOICE NO:</b> ${invoice.invoiceNumber}</p>
    <p><b>JOB NO:</b> ${jobNumber}</p>
    <p><b>PAYMENT METHOD:</b> ${paymentMethod}</p>
    <p class="full-width"><b>CUSTOMER:</b> ${invoice.customerName}</p>
    <p class="full-width"><b>CONTACT NUMBER:</b> ${invoice.customerPhone}</p>
</div>

<!-- Items Table -->
<table>
    <thead>
        <tr>
            <th style="width: 5%;">No</th>
            <th style="width: 11%;">Item Code</th>
            <th style="width: 28%;">Description</th>
            <th style="width: 11%;">Warranty</th>
            <th style="width: 11%;">Warranty No</th>
            <th style="width: 7%;">QTY</th>
            <th style="width: 13%;">Unit Price</th>
            <th style="width: 14%;">Amount</th>
        </tr>
    </thead>
    <tbody>
        ${servicesHTML}
        ${itemsHTML}
    </tbody>
</table>

<!-- Total Section -->
<table class="totals">
    <tr>
        <td class="label highlight">TOTAL</td>
        <td class="value highlight">${calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
    <tr>
        <td class="label">DISCOUNT</td>
        <td class="value">${(invoice.discount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
    <tr>
        <td class="label">ADVANCE</td>
        <td class="value">${advanceAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
    <tr>
        <td class="label highlight">SUB TOTAL</td>
        <td class="value highlight">${subTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
    <tr>
        <td class="label">BALANCE</td>
        <td class="value">${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
</table>

<div class="notice">
    <b>Important Notice</b>
    <ul>
        <li>Warranty covers only manufacturer's defects. Damages or defects due to misuse, negligence, or power issues are not covered.</li>
        <li>Repairs or replacements may include labor or material costs.</li>
        <li>No warranty for cartridges, power adaptors, some battery types, and software.</li>
    </ul>
</div>

<div class="signatures">
    <div>
        <hr>
        <p>Authorized</p>
    </div>
    <div>
        <hr>
        <p>Customer Signature</p>
    </div>
</div>

</body>
</html>
`;
  };

  const openPreview = () => {
    const previewHTML = generatePreviewHTML();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(previewHTML);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  const exportTemplatePDF = () => {
    if (!invoice) return;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    // Header with logo
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('E - TECHCARE', margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.text('No.158, Wakwella Road, Galle', margin, yPosition);
    yPosition += 4;
    pdf.text('TEL: 076 795 7125 | EMAIL: etechcarelh@gmail.com', margin, yPosition);
    yPosition += 4;
    pdf.text('WHATSAPP: 076 795 7125', margin, yPosition);
    yPosition += 8;

    // Add logo if available
    if (COMPANY_LOGO_BASE64 && COMPANY_LOGO_BASE64 !== 'data:image/png;base64,YOUR_BASE64_CODE_HERE') {
      try {
        pdf.addImage(COMPANY_LOGO_BASE64, 'PNG', pageWidth - margin - 25, margin, 25, 25);
      } catch (e) {
        console.error('Error adding logo to PDF:', e);
        // Fallback: draw placeholder box
        pdf.rect(pageWidth - margin - 25, margin, 25, 25);
        pdf.setFontSize(7);
        pdf.text('Logo', pageWidth - margin - 12.5, margin + 12.5, { align: 'center' });
      }
    } else {
      // Draw placeholder box
      pdf.rect(pageWidth - margin - 25, margin, 25, 25);
      pdf.setFontSize(7);
      pdf.text('Company Logo', pageWidth - margin - 12.5, margin + 12.5, { align: 'center' });
    }

    // Horizontal line
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Invoice Title
    pdf.setFontSize(16);
    pdf.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Invoice Details
    const jobNumber = invoice.jobCard?.jobNumber || 'N/A';
    const details = [
      [`DATE: ${new Date(invoice.createdAt).toLocaleDateString()}`, `USER: Admin`, `JOB NO: ${jobNumber}`],
      [`INVOICE NO: ${invoice.invoiceNumber}`, `PMT METHOD: ${invoice.paymentMethod || 'Cash'}`, `CUSTOMER: ${invoice.customerName}`],
      [`CONTACT NUMBER: ${invoice.customerPhone}`, '', '']
    ];

    pdf.setFontSize(8);
    details.forEach(row => {
      pdf.text(row[0], margin, yPosition);
      pdf.text(row[1], pageWidth / 2, yPosition, { align: 'center' });
      pdf.text(row[2], pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 4;
    });
    yPosition += 5;

    // ✅ Items Table with Services, itemCode, warranty AND warrantyNumber
    const servicesData = (invoice.jobCard?.serviceCategories || []).map((service, index) => [
      (index + 1).toString(),
      'SERVICE',
      service.name,
      'Service',
      '-',
      '1',
      `Rs.${(service.servicePrice || 0).toFixed(2)}`,
      `Rs.${(service.servicePrice || 0).toFixed(2)}`
    ]);

    const itemsData = (invoice.items || []).map((item, index) => [
      ((invoice.jobCard?.serviceCategories?.length || 0) + index + 1).toString(),
      item.itemCode || item.sku || 'N/A',
      item.itemName || 'Item',
      item.warranty || 'No Warranty',
      item.warrantyNumber || '-',
      (item.quantity || 0).toString(),
      `Rs.${(item.unitPrice || 0).toFixed(2)}`,
      `Rs.${(item.total || 0).toFixed(2)}`
    ]);

    const combinedData = [...servicesData, ...itemsData];

    pdf.autoTable({
      startY: yPosition,
      head: [['No', 'Item Code', 'Description', 'Warranty', 'Warranty No', 'QTY', 'Unit Price', 'Amount']],
      body: combinedData,
      styles: { 
        fontSize: 7,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      margin: { left: margin, right: margin },
      tableWidth: pageWidth - (margin * 2)
    });

    let finalY = pdf.lastAutoTable.finalY + 5;

    // Calculate totals
    const servicesTotal = (invoice.jobCard?.serviceCategories || [])
      .reduce((sum, service) => sum + (service.servicePrice || 0), 0);
    const invoiceItemsTotal = (invoice.items || [])
      .reduce((sum, item) => sum + (item.total || 0), 0);
    
    const itemsSubtotal = invoice.subtotal || 0;
    const combinedSubtotal = servicesTotal + itemsSubtotal;
    
    // TOTAL = Service Total + Invoice Items Total ONLY
    const calculatedTotal = servicesTotal + invoiceItemsTotal;
    const advanceAmount = invoice.paymentStatus === 'PAID' ? 0 : invoice.paidAmount;
    const calculatedSubTotal = calculatedTotal - (invoice.discount || 0) - advanceAmount;
    const finalBalance = invoice.paymentStatus === 'PAID' ? 0 : invoice.balance;

    pdf.setFontSize(8);
    pdf.setFont(undefined, 'bold');
    pdf.text(`ITEMS SUBTOTAL: Rs.${itemsSubtotal.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    finalY += 4;
    pdf.text(`SERVICES TOTAL: Rs.${servicesTotal.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    finalY += 4;
    pdf.text(`COMBINED TOTAL: Rs.${combinedSubtotal.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    finalY += 4;
    pdf.text(`TOTAL: Rs.${calculatedTotal.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    finalY += 4;
    pdf.text(`DISCOUNT: Rs.${(invoice.discount || 0).toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    finalY += 4;
    pdf.text(`ADVANCE: Rs.${advanceAmount.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    finalY += 4;
    pdf.text(`SUB TOTAL: Rs.${calculatedSubTotal.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    finalY += 4;
    pdf.text(`BALANCE: Rs.${finalBalance.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    finalY += 10;

    // Important Notice
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(7);
    pdf.text('Important Notice:', margin, finalY);
    finalY += 4;
    pdf.text('- Warranty covers only manufacturer\'s defects. Damages due to misuse not covered.', margin, finalY);
    finalY += 3;
    pdf.text('- Repairs may include labor or material costs.', margin, finalY);
    finalY += 3;
    pdf.text('- No warranty for cartridges, adaptors, batteries, software.', margin, finalY);
    finalY += 10;

    // Signatures
    const signatureY = finalY + 15;
    pdf.line(margin + 10, signatureY, margin + 50, signatureY);
    pdf.line(pageWidth - margin - 50, signatureY, pageWidth - margin - 10, signatureY);
    pdf.text('Authorized', margin + 30, signatureY + 5, { align: 'center' });
    pdf.text('Customer Signature', pageWidth - margin - 30, signatureY + 5, { align: 'center' });

    pdf.save(`Invoice_${invoice.invoiceNumber}_A5.pdf`);
  };

  const exportPDF = () => {
    if (!invoice) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, yPosition);
    yPosition += 12;

    // Customer Info
    doc.setFont(undefined, 'bold');
    doc.text('Customer Information:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += 6;
    doc.setFontSize(9);
    doc.text(`Name: ${invoice.customerName}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Phone: ${invoice.customerPhone}`, 20, yPosition);
    yPosition += 5;
    if (invoice.customerEmail) {
      doc.text(`Email: ${invoice.customerEmail}`, 20, yPosition);
      yPosition += 5;
    }

    // Job Card Info
    if (invoice.jobCard) {
      yPosition += 3;
      doc.setFont(undefined, 'bold');
      doc.text('Job Card Details:', 20, yPosition);
      doc.setFont(undefined, 'normal');
      yPosition += 5;
      doc.text(`Job Number: ${invoice.jobCard.jobNumber}`, 20, yPosition);
      yPosition += 5;
      if (invoice.jobCard.fault) {
        doc.text(`Fault Type: ${invoice.jobCard.fault.faultName}`, 20, yPosition);
        yPosition += 5;
      }
    }

    yPosition += 5;

    // ✅ Items Table with itemCode, warranty AND warrantyNumber
    const itemsData = (invoice.items || []).map(item => [
      item.itemCode || item.sku || 'N/A',
      item.itemName || 'Item',
      item.quantity || 0,
      `Rs.${(item.unitPrice || 0).toFixed(2)}`,
      item.warranty || 'None',
      item.warrantyNumber || '-',
      `Rs.${(item.total || 0).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Code', 'Description', 'Qty', 'Rate', 'Warranty', 'Warranty #', 'Total']],
      body: itemsData,
      margin: { left: 20, right: 20 }
    });

    // Totals
    let finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.text(`Subtotal: Rs.${invoice.subtotal.toFixed(2)}`, 20, finalY);
    doc.text(`Discount: -Rs.${invoice.discount.toFixed(2)}`, 20, finalY + 6);
    doc.text(`Tax: +Rs.${invoice.tax.toFixed(2)}`, 20, finalY + 12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: Rs.${invoice.total.toFixed(2)}`, 20, finalY + 20);
    doc.setFont(undefined, 'normal');
    doc.text(`Paid: Rs.${invoice.paidAmount.toFixed(2)}`, 20, finalY + 26);
    doc.text(`Balance: Rs.${invoice.balance.toFixed(2)}`, 20, finalY + 32);

    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PAID: 'bg-green-100 text-green-800 border-green-300',
      PARTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      UNPAID: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Invoice not found'}
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back
        </button>
      </div>
    );
  }

  // Get device serials only (DEVICE_SERIAL type)
  const deviceSerials = invoice.jobCard?.serials?.filter(s => s.serialType === 'DEVICE_SERIAL') || [];

  // Calculate total for used items
  const usedItemsTotal = (invoice.jobCard?.usedItems || []).reduce((sum, item) => {
    return sum + (item.quantityUsed * (item.unitPrice || 0));
  }, 0);

  // Calculate total services cost from job card
  const jobCardServicesTotal = (invoice.jobCard?.serviceCategories || [])
    .reduce((sum, service) => sum + (service.servicePrice || 0), 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{invoice.invoiceNumber}</h1>
              <p className="text-blue-100">Invoice Details</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getPaymentStatusColor(invoice.paymentStatus)}`}>
              {invoice.paymentStatus}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Name</p>
                <p className="font-semibold text-gray-900">{invoice.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">{invoice.customerPhone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{invoice.customerEmail || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Job Card Information */}
          {invoice.jobCard && (
            <>
              {/* Job Card Header */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Job Card Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-green-50 p-4 rounded-lg border-2 border-green-300">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Job Number</p>
                    <p className="font-bold text-lg text-green-700">{invoice.jobCard.jobNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Device Type</p>
                    <p className="font-semibold text-gray-900">{invoice.jobCard.deviceType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="font-semibold text-gray-900">{invoice.jobCard.status}</p>
                  </div>
                </div>
              </div>

              {/* Fault Information */}
              {invoice.jobCard.fault && (
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Fault Information
                  </h2>
                  <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-600">Fault Type</p>
                      <p className="font-bold text-lg text-red-700">{invoice.jobCard.fault.faultName}</p>
                    </div>
                    <div className="pt-3 border-t border-red-200">
                      <p className="text-sm font-medium text-gray-600 mb-2">Fault Description</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{invoice.jobCard.faultDescription}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Device Serial */}
              {deviceSerials.length > 0 && (
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Device Serial
                  </h2>
                  <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg">
                    <div className="space-y-2">
                      {deviceSerials.map((serial, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded border-2 border-blue-400">
                          <div className="flex items-center">
                            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded mr-3">DEVICE_SERIAL</span>
                            <span className="text-gray-700 font-semibold text-lg">{serial.serialValue}</span>
                          </div>
                          <span className="text-blue-600 text-sm font-medium">🔹 Primary</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Used Items / Parts - WITH WARRANTY */}
              {invoice.jobCard.usedItems && invoice.jobCard.usedItems.length > 0 && (
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10M8 15h8" />
                    </svg>
                    Used Items / Parts
                  </h2>
                  <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-green-300">
                            <th className="text-left py-3 px-2 font-semibold text-gray-900">Item Code</th>
                            <th className="text-left py-3 px-2 font-semibold text-gray-900">Item Name</th>
                            <th className="text-center py-3 px-2 font-semibold text-gray-900">Qty</th>
                            <th className="text-right py-3 px-2 font-semibold text-gray-900">Unit Price</th>
                            <th className="text-right py-3 px-2 font-semibold text-gray-900">Total</th>
                            <th className="text-left py-3 px-2 font-semibold text-gray-900">Warranty</th>
                            <th className="text-center py-3 px-2 font-semibold text-gray-900">Warranty #</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-green-200">
                          {invoice.jobCard.usedItems.map((item, index) => {
                            const itemTotal = (item.quantityUsed || 0) * (item.unitPrice || 0);
                            return (
                              <tr key={index} className="hover:bg-green-100 transition-colors">
                                <td className="py-3 px-2">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                                    {item.inventoryItem?.sku || 'N/A'}
                                  </span>
                                </td>
                                <td className="py-3 px-2">
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {item.inventoryItem?.name || 'Unknown Item'}
                                    </p>
                                  </div>
                                </td>
                                <td className="text-center py-3 px-2">
                                  <span className="bg-green-200 text-green-800 px-3 py-1 rounded font-semibold">
                                    {item.quantityUsed}
                                  </span>
                                </td>
                                <td className="text-right py-3 px-2">
                                  <span className="font-semibold text-gray-900">
                                    Rs.{(item.unitPrice || 0).toFixed(2)}
                                  </span>
                                </td>
                                <td className="text-right py-3 px-2">
                                  <span className="font-bold text-green-700">
                                    Rs.{itemTotal.toFixed(2)}
                                  </span>
                                </td>
                                <td className="text-left py-3 px-2">
                                  {item.warranty ? (
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                      {item.warranty}
                                    </span>
                                  ) : (
                                    <span className="text-gray-500 text-xs">None</span>
                                  )}
                                </td>
                                <td className="text-center py-3 px-2">
                                  {item.warrantyNumber ? (
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono font-bold">
                                      {item.warrantyNumber}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Total Parts Cost */}
                    <div className="mt-4 border-t-2 border-green-300 pt-4 flex justify-end">
                      <div className="bg-green-100 px-6 py-3 rounded-lg border-2 border-green-400">
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-lg font-semibold text-gray-900">Total Parts Cost:</span>
                          <span className="text-2xl font-bold text-green-700">
                            Rs.{usedItemsTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Job Card Services Section */}
              {invoice.jobCard?.serviceCategories && invoice.jobCard.serviceCategories.length > 0 && (
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Services Performed
                  </h2>
                  <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-purple-300">
                            <th className="text-left py-3 px-2 font-semibold text-gray-900">Service Name</th>
                            <th className="text-left py-3 px-2 font-semibold text-gray-900">Service Code</th>
                            <th className="text-left py-3 px-2 font-semibold text-gray-900">Description</th>
                            <th className="text-right py-3 px-2 font-semibold text-gray-900">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-200">
                          {invoice.jobCard.serviceCategories.map((service, index) => (
                            <tr key={index} className="hover:bg-purple-100 transition-colors">
                              <td className="py-3 px-2">
                                <span className="font-semibold text-gray-900">{service.name}</span>
                              </td>
                              <td className="py-3 px-2">
                                <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                  {service.code}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-gray-600">
                                {service.description || 'N/A'}
                              </td>
                              <td className="text-right py-3 px-2">
                                <span className="font-bold text-purple-700">
                                  Rs.{(service.servicePrice || 0).toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Total Services Cost */}
                    <div className="mt-4 border-t-2 border-purple-300 pt-4 flex justify-end">
                      <div className="bg-purple-100 px-6 py-3 rounded-lg border-2 border-purple-400">
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-lg font-semibold text-gray-900">Total Services Cost:</span>
                          <span className="text-2xl font-bold text-purple-700">
                            Rs.{jobCardServicesTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Services Section */}
          {invoice.items && invoice.items.filter(item => item.itemType === 'SERVICE').length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Services Provided
              </h2>
              <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-purple-300">
                        <th className="text-left py-3 px-2 font-semibold text-gray-900">Service Name</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-900">Qty</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-900">Price</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-200">
                      {invoice.items
                        .filter(item => item.itemType === 'SERVICE')
                        .map((item, idx) => (
                          <tr key={idx} className="hover:bg-purple-100 transition-colors">
                            <td className="px-2 py-3 text-gray-900 font-medium">{item.itemName}</td>
                            <td className="text-center py-3 px-2 font-semibold">
                              <span className="bg-purple-200 text-purple-800 px-3 py-1 rounded">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="text-right py-3 px-2 font-semibold text-gray-900">
                              Rs.{(item.unitPrice || 0).toFixed(2)}
                            </td>
                            <td className="text-right py-3 px-2 font-bold text-purple-700">
                              Rs.{(item.total || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Services Total */}
                <div className="mt-4 border-t-2 border-purple-300 pt-4 flex justify-end">
                  <div className="bg-purple-100 px-6 py-3 rounded-lg border-2 border-purple-400">
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-lg font-semibold text-gray-900">Total Services:</span>
                      <span className="text-2xl font-bold text-purple-700">
                        Rs.{invoice.items
                          .filter(item => item.itemType === 'SERVICE')
                          .reduce((sum, item) => sum + (item.total || 0), 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parts Section */}
          {invoice.items && invoice.items.filter(item => item.itemType === 'PART').length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Parts/Items Used
              </h2>
              <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-green-300">
                        <th className="text-left py-3 px-2 font-semibold text-gray-900">Item Code</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-900">Item Name</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-900">Qty</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-900">Price</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-900">Warranty</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-900">Warranty #</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-200">
                      {invoice.items
                        .filter(item => item.itemType === 'PART')
                        .map((item, idx) => (
                          <tr key={idx} className="hover:bg-green-100 transition-colors">
                            <td className="px-2 py-3">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                                {item.itemCode || item.sku || 'N/A'}
                              </span>
                            </td>
                            <td className="px-2 py-3 text-gray-900 font-medium">{item.itemName}</td>
                            <td className="text-center py-3 px-2 font-semibold">
                              <span className="bg-green-200 text-green-800 px-3 py-1 rounded">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="text-right py-3 px-2 font-semibold text-gray-900">
                              Rs.{(item.unitPrice || 0).toFixed(2)}
                            </td>
                            <td className="text-center py-3 px-2">
                              {item.warranty && item.warranty !== 'No Warranty' ? (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                  {item.warranty}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs">None</span>
                              )}
                            </td>
                            <td className="text-center py-3 px-2">
                              {item.warrantyNumber ? (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono font-bold">
                                  {item.warrantyNumber}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="text-right py-3 px-2 font-bold text-green-700">
                              Rs.{(item.total || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Parts Total */}
                <div className="mt-4 border-t-2 border-green-300 pt-4 flex justify-end">
                  <div className="bg-green-100 px-6 py-3 rounded-lg border-2 border-green-400">
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-lg font-semibold text-gray-900">Total Parts:</span>
                      <span className="text-2xl font-bold text-green-700">
                        Rs.{invoice.items
                          .filter(item => item.itemType === 'PART')
                          .reduce((sum, item) => sum + (item.total || 0), 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Items Table - MAIN ITEMS */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Invoice Items
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Item Code</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">Qty</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Rate</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">Warranty</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">Warranty #</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                            {item.itemCode || item.sku || 'N/A'}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{item.itemName || 'Item'}</p>
                            {item.serialNumbers && item.serialNumbers.length > 0 && (
                              <div className="text-xs text-gray-600 mt-1">
                                <span className="font-medium">Serials: </span>
                                <span>{item.serialNumbers.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-4 py-3 text-center font-semibold text-gray-900">
                          {item.quantity || 0}
                        </td>
                        
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          Rs.{(item.unitPrice || 0).toFixed(2)}
                        </td>
                        
                        <td className="px-4 py-3 text-center">
                          {item.warranty && item.warranty !== 'No Warranty' ? (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              {item.warranty}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-xs">None</span>
                          )}
                        </td>
                        
                        <td className="px-4 py-3 text-center">
                          {item.warrantyNumber ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono font-bold">
                              {item.warrantyNumber}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        
                        <td className="px-4 py-3 text-right font-bold text-blue-600">
                          Rs.{(item.total || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                        No items in invoice
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">Rs.{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold text-red-600">-Rs.{invoice.discount.toFixed(2)}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold text-gray-900">+Rs.{invoice.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t-2 border-blue-300 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">Rs.{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium mb-1">Amount Paid</p>
              <p className="text-2xl font-bold text-green-700">Rs.{invoice.paidAmount.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-600 font-medium mb-1">Balance Due</p>
              <p className="text-2xl font-bold text-yellow-700">Rs.{invoice.balance.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium mb-1">Payment Method</p>
              <p className="text-lg font-bold text-blue-700">{invoice.paymentMethod || 'Not Set'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
            >
              Print
            </button>
            <button
              onClick={openPreview}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Preview A5 Template</span>
            </button>
            <button
              onClick={exportTemplatePDF}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download A5 PDF</span>
            </button>
            {invoice.paymentStatus !== 'PAID' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
              >
                Add Payment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          invoice={invoice}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default InvoiceView;