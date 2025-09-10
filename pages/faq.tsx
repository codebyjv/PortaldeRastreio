import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../src/components/ui/accordion';
import { HelpCircle } from 'lucide-react';
import { faqs } from '../src/lib/faqData';

export const FAQPage = () => {
    return (
        <div className="bg-gray-50/90">
            <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
                <div className="text-center mb-12">
                    <HelpCircle className="mx-auto h-12 w-12 text-red-600" />
                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                        Perguntas Frequentes
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Encontre aqui as respostas para as dúvidas mais comuns.
                    </p>
                </div>

                <div className="space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem value={`item-${index}`} key={index} className="border-b-0 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                                <AccordionTrigger className="px-6 py-4 text-lg font-medium text-gray-800 hover:no-underline text-left">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4 text-base text-gray-600">
                                    {typeof faq.answer === 'string' ? <p>{faq.answer}</p> : faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;

